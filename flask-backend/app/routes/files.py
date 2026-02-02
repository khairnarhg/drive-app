from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from app.models import File, Folder, User
from app import db
from app.services.storage import LocalStorageService
import mimetypes
import logging
import os

# Configure logging
logger = logging.getLogger(__name__)

files_bp = Blueprint("files", __name__, url_prefix="/files")

@files_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_files():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if "files" not in request.files:
        return jsonify({"error": "No files part in the request"}), 400

    files = request.files.getlist("files") # Get all files from the 'files' key
    folder_id = request.form.get("folder_id")
    
    # Handle folder validation once
    target_folder_id = None
    if folder_id and folder_id.lower() != 'null':
        folder = Folder.query.filter_by(id=folder_id, owner_id=user_id).first()
        if not folder:
            return jsonify({"error": "Invalid folder"}), 404
        target_folder_id = folder.id

    results = []
    errors = []

    for file in files:
        if file.filename == "": continue

        try:
            # 1. Quota Check
            file.stream.seek(0, 2)
            file_size = file.stream.tell()
            file.stream.seek(0)

            if user.used_quota + file_size > user.total_quota:
                errors.append({"file": file.filename, "error": "Quota exceeded"})
                continue

            # 2. Save to Disk
            storage = LocalStorageService(current_app.config["LOCAL_STORAGE_PATH"])
            storage_key = storage.save(file.stream)

            # 3. DB Entry
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
            db.session.commit() # Commit per file to ensure partial success works

            results.append({"id": db_file.id, "name": db_file.name})

        except Exception as e:
            db.session.rollback()
            errors.append({"file": file.filename, "error": str(e)})

    return jsonify({
        "uploaded": results,
        "errors": errors
    }), 201 if results else 400


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

        # 2. Locate File on Disk
        storage = LocalStorageService(current_app.config["LOCAL_STORAGE_PATH"])
        
        # Construct the absolute path
        # Using os.path.abspath ensures we resolve any potential ".." traversal, 
        # though joining with a trusted config path is usually safe.
        file_path = os.path.join(storage.base_path, file.storage_key)

        # 3. Data Integrity Check
        # This catches the critical "Orphan Record" edge case
        if not os.path.exists(file_path):
            logger.critical(f"DATA INTEGRITY ERROR: DB record {file.id} exists, but file missing on disk at {file_path}")
            return jsonify({"error": "File system error: Content missing"}), 500

        # 4. Serve File
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

        # 2. Define File Path
        file_path = os.path.join(
            current_app.config["LOCAL_STORAGE_PATH"],
            file.storage_key
        )

        # 3. Delete from Disk
        # We attempt this BEFORE DB commit. If disk deletion fails (e.g., permission denied),
        # we abort the whole operation so the DB stays in sync.
        file_deleted_from_disk = False
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                file_deleted_from_disk = True
            except OSError as e:
                logger.error(f"Failed to delete file from disk: {file_path}. Error: {e}")
                return jsonify({"error": "System error: Could not delete file from storage"}), 500
        else:
            logger.warning(f"File {file_id} marked for deletion but missing on disk.")
            # We proceed to delete from DB even if missing on disk (self-healing)

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
