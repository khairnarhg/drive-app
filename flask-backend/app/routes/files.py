from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from app.models import File, Folder, User
from app import db
from app.services.storage import get_storage_service
import mimetypes
import logging
import os
from io import BytesIO
from urllib.request import urlopen
from urllib.error import URLError, HTTPError

# Configure logging
logger = logging.getLogger(__name__)

files_bp = Blueprint("files", __name__, url_prefix="/files")

@files_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_files():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "files" not in request.files:
        return jsonify({"error": "No files part in the request"}), 400

    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files in request"}), 400

    folder_id = request.form.get("folder_id")
    target_folder_id = None
    if folder_id and str(folder_id).lower() != "null":
        folder = Folder.query.filter_by(id=folder_id, owner_id=user_id).first()
        if not folder:
            return jsonify({"error": "Invalid folder"}), 404
        target_folder_id = folder.id

    try:
        storage = get_storage_service(current_app.config)
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    results = []
    errors = []

    for file in files:
        if not file or not file.filename:
            continue

        try:
            file.stream.seek(0, 2)
            file_size = file.stream.tell()
            file.stream.seek(0)

            if user.used_quota + file_size > user.total_quota:
                errors.append({"file": file.filename, "error": "Quota exceeded"})
                continue

            storage_key = storage.save(file.stream, filename=file.filename)

            mime_type = mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
            db_file = File(
                name=file.filename,
                size=file_size,
                mime_type=mime_type,
                owner_id=user_id,
                folder_id=target_folder_id,
                storage_key=storage_key
            )
            user.used_quota += file_size
            db.session.add(db_file)
            db.session.commit()

            results.append({"id": db_file.id, "name": db_file.name})

        except Exception as e:
            db.session.rollback()
            error_msg = str(e)
            # Check for Cloudinary-specific errors
            if "untrusted" in error_msg.lower() or "show_original_customer_untrusted" in error_msg.lower():
                logger.error(f"Cloudinary account restriction for file {file.filename}: {error_msg}")
                errors.append({
                    "file": file.filename, 
                    "error": "Cloudinary account restriction. Please check your Cloudinary dashboard or contact support."
                })
            else:
                errors.append({"file": file.filename, "error": error_msg})

    if not results:
        first_error = errors[0]["error"] if errors else "No valid files to upload"
        return jsonify({
            "error": first_error,
            "uploaded": [],
            "errors": errors,
        }), 400

    return jsonify({
        "uploaded": results,
        "errors": errors,
    }), 201


@files_bp.route("/<int:file_id>/download", methods=["GET"])
@jwt_required()
def download_file(file_id):
    user_id = get_jwt_identity()

    try:
        # 1. Database Lookup
        # We explicitly filter by owner_id to prevent users downloading other users' files
        file = File.query.filter_by(
            id=file_id,
            owner_id=user_id,
            status="ACTIVE"  # Ensure we don't serve deleted/archived files
        ).first()

        if not file:
            # Log this as a warning - could be a mistake or an enumeration attack
            logger.warning(f"User {user_id} attempted to download missing or unauthorized file: {file_id}")
            return jsonify({"error": "File not found"}), 404

        # 2. Get Storage Service
        storage = get_storage_service(current_app.config)
        
        # 3. Handle remote storage (Cloudinary/S3/R2) vs Local Storage
        if hasattr(storage, 'get_download_url'):
            # Remote: fetch file server-side and stream to client so the browser
            # never follows a redirect (which would drop Authorization and can cause 401 from CDN).
            logger.info(f"Proxying download for file {file.id} from remote storage")
            try:
                # Prefer authenticated download method if available (for Cloudinary)
                if hasattr(storage, 'download_file_content'):
                    content = storage.download_file_content(file.storage_key)
                else:
                    # Fallback: use signed URL with urlopen (for S3/R2)
                    download_url = storage.get_download_url(file.storage_key)
                    with urlopen(download_url, timeout=60) as resp:
                        content = resp.read()
            except (URLError, HTTPError, OSError, Exception) as e:
                logger.error(f"Failed to fetch file from storage for file {file.id}: {e}")
                return jsonify({"error": "Could not retrieve file from storage"}), 502
            return send_file(
                BytesIO(content),
                as_attachment=True,
                download_name=file.name,
                mimetype=file.mime_type,
            )
        else:
            # Local: Serve file directly
            file_path = storage.get_file_path(file.storage_key)
            if not os.path.exists(file_path):
                logger.critical(f"DATA INTEGRITY ERROR: DB record {file.id} exists, but file missing at {file_path}")
                return jsonify({"error": "File system error: Content missing"}), 500
            
            logger.info(f"Serving file download: {file.id} for user {user_id}")
            return send_file(
                file_path,
                as_attachment=True,
                download_name=file.name,
                mimetype=file.mime_type
            )

    except SQLAlchemyError as e:
        logger.error(f"Database error during download for file {file_id}: {str(e)}")
        return jsonify({"error": "Database service unavailable"}), 500

    except OSError as e:
        # Catch file system permission errors or read errors
        logger.error(f"OS/IO error reading file {file_id}: {str(e)}")
        return jsonify({"error": "Error reading file content"}), 500

    except Exception as e:
        logger.error(f"Unexpected error in download route: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500


@files_bp.route("/<int:file_id>/trash", methods=["POST"])
@jwt_required()
def move_to_trash(file_id):
    user_id = get_jwt_identity()

    try:
        # Filter strictly by ACTIVE status so we don't re-trash items
        file = File.query.filter_by(
            id=file_id,
            owner_id=user_id,
            status="ACTIVE"
        ).first()

        if not file:
            return jsonify({"error": "File not found or already in trash"}), 404

        file.status = "TRASH"
        db.session.commit()
        
        logger.info(f"File {file_id} moved to trash by user {user_id}")
        return jsonify({"message": "File moved to trash"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error moving file {file_id} to trash: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        logger.error(f"Unexpected error in move_to_trash: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500


@files_bp.route("/trash", methods=["GET"])
@jwt_required()
def list_trash():
    user_id = get_jwt_identity()

    try:
        files = File.query.filter_by(
            owner_id=user_id,
            status="TRASH"
        ).order_by(File.created_at.desc()).all()

        return jsonify([
            {
                "id": f.id,
                "name": f.name,
                "size": f.size,
                "created_at": f.created_at.isoformat() if f.created_at else None
            } for f in files
        ]), 200

    except SQLAlchemyError as e:
        logger.error(f"Database error listing trash for user {user_id}: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        logger.error(f"Unexpected error in list_trash: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500


@files_bp.route("/<int:file_id>/restore", methods=["POST"])
@jwt_required()
def restore_file(file_id):
    user_id = get_jwt_identity()

    try:
        file = File.query.filter_by(
            id=file_id,
            owner_id=user_id,
            status="TRASH"
        ).first()

        if not file:
            return jsonify({"error": "File not found in trash"}), 404

        file.status = "ACTIVE"
        db.session.commit()

        logger.info(f"File {file_id} restored by user {user_id}")
        return jsonify({"message": "File restored successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error restoring file {file_id}: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        logger.error(f"Unexpected error in restore_file: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500


@files_bp.route("/<int:file_id>", methods=["DELETE"])
@jwt_required()
def delete_file_permanently(file_id):
    """
    Permanently deletes a file from disk and marks it as DELETED in DB.
    Also releases the user's storage quota.
    """
    user_id = get_jwt_identity()

    try:
        # 1. Fetch File and User
        # Note: We fetch the user explicitly to lock/update the quota reliably
        user = User.query.get(user_id)
        
        # We allow deleting from TRASH or ACTIVE states
        file = File.query.filter(
            File.id == file_id,
            File.owner_id == user_id,
            File.status.in_(["ACTIVE", "TRASH"]) 
        ).first()

        if not file:
            return jsonify({"error": "File not found"}), 404

        # 2. Get Storage Service and Delete File
        try:
            storage = get_storage_service(current_app.config)
            storage.delete(file.storage_key)
        except ValueError as e:
            # Storage config error
            logger.error(f"Storage configuration error: {e}")
            return jsonify({"error": "Storage configuration error"}), 500
        except Exception as e:
            logger.error(f"Failed to delete file from storage: {file.storage_key}. Error: {e}")
            # For S3/R2, deletion might fail if file doesn't exist - we proceed anyway
            # For local storage, check if file exists first
            if hasattr(storage, 'get_file_path'):
                try:
                    file_path = storage.get_file_path(file.storage_key)
                    if os.path.exists(file_path):
                        return jsonify({"error": "System error: Could not delete file from storage"}), 500
                except:
                    pass
            logger.warning(f"File {file_id} marked for deletion but missing in storage.")

        # 4. Update Database (Quota & Status)
        try:
            # Update quota (ensure we don't go below zero)
            if user.used_quota >= file.size:
                user.used_quota -= file.size
            else:
                user.used_quota = 0

            # You can either delete the row entirely:
            # db.session.delete(file)
            
            # OR keep it as "DELETED" for audit logs (as per your original code):
            file.status = "DELETED"
            # Optional: Clear the storage key so we know it's gone
            file.storage_key = None 

            db.session.commit()
            
            logger.info(f"File {file_id} permanently deleted by user {user_id}")
            return jsonify({"message": "File permanently deleted"}), 200

        except SQLAlchemyError as db_err:
            db.session.rollback()
            logger.critical(f"DB Commit failed after disk deletion for file {file_id}! DATA INCONSISTENCY. Error: {db_err}")
            # At this point, the file is gone from disk but DB says it exists.
            # This is a critical error, but for the user, we return 500.
            return jsonify({"error": "Database error during deletion"}), 500

    except Exception as e:
        logger.error(f"Unexpected error in delete_file_permanently: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500
