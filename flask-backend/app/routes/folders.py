from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from app.models import Folder, File
from app import db
import logging

# Configure logging
logger = logging.getLogger(__name__)

folders_bp = Blueprint("folders", __name__, url_prefix="/folders")

@folders_bp.route("/", methods=["POST"])
@jwt_required()
def create_folder():
    """
    Creates a new folder.
    Expects JSON: { "name": "Folder Name", "parent_id": <int|null> }
    """
    user_id = get_jwt_identity()
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid input, JSON body required"}), 400

        name = data.get("name")
        parent_id = data.get("parent_id")

        if not name:
            return jsonify({"error": "Folder name is required"}), 400
        
        # Logic to determine parent folder
        final_parent_id = None
        
        if parent_id:
            # If a parent_id is requested, we MUST verify it exists and belongs to the user.
            # If it doesn't exist, we should fail rather than defaulting to root.
            parent = Folder.query.filter_by(id=parent_id, owner_id=user_id).first()
            
            if not parent:
                return jsonify({"error": "Parent folder not found or access denied"}), 404
            
            final_parent_id = parent.id

        # Create new folder instance
        folder = Folder(
            name=name,
            owner_id=user_id,
            parent_id=final_parent_id #
        )


        db.session.add(folder)
        db.session.commit()

        logger.info(f"User {user_id} created folder {folder.id} ('{folder.name}')")

        return jsonify({
            "id": folder.id,
            "name": folder.name,
            "parent_id": folder.parent_id
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error creating folder for user {user_id}: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500

    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error creating folder for user {user_id}: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500


# @folders_bp.route("/<int:folder_id>/contents", methods=["GET"])
# @jwt_required()
# def list_contents(folder_id):
#     """
#     Lists subfolders (and potentially files) within a specific folder.
#     """
#     user_id = get_jwt_identity()

#     try:
#         # Verify the folder exists and belongs to the user
#         folder = Folder.query.filter_by(
#             id=folder_id,
#             owner_id=user_id
#         ).first()

#         if not folder:
#             return jsonify({"error": "Folder not found"}), 404

#         # Fetch subfolders
#         subfolders = Folder.query.filter_by(
#             parent_id=folder.id,
#             owner_id=user_id
#         ).all()

#         # NOTE: If you have a 'File' model, you would fetch files here as well
#         # files = File.query.filter_by(folder_id=folder.id, owner_id=user_id).all()

#         response_data = {
#             "id": folder.id,
#             "name": folder.name,
#             "contents": {
#                 "folders": [{"id": f.id, "name": f.name} for f in subfolders],
#                 # "files": [{"id": f.id, "name": f.name} for f in files] 
#             }
#         }

#         return jsonify(response_data), 200

#     except SQLAlchemyError as e:
#         logger.error(f"Database error listing contents for folder {folder_id}: {str(e)}")
#         return jsonify({"error": "Database error occurred"}), 500

#     except Exception as e:
#         logger.error(f"Unexpected error listing contents for folder {folder_id}: {str(e)}")
#         return jsonify({"error": "An internal error occurred"}), 500


@folders_bp.route("/<int:folder_id>/contents", methods=["GET"])
@jwt_required()
def list_contents(folder_id):
    user_id = get_jwt_identity()

    try:
        # 1. Verify Parent Folder Existence & Ownership
        folder = Folder.query.filter_by(
            id=folder_id,
            owner_id=user_id
        ).first()

        if not folder:
            # It's good practice to log these "Not Found" errors as warnings
            # to detect if a specific user is scanning for IDs.
            logger.warning(f"User {user_id} attempted to access missing folder: {folder_id}")
            return jsonify({"error": "Folder not found"}), 404

        # 2. Fetch Subfolders
        # Ordered by newest first
        subfolders = Folder.query.filter_by(
            parent_id=folder.id,
            owner_id=user_id
        ).order_by(Folder.created_at.desc()).all()

        # 3. Fetch Files
        # We filter by status="ACTIVE" to hide deleted files
        files = File.query.filter_by(
            folder_id=folder.id,
            owner_id=user_id,
            status="ACTIVE"
        ).order_by(File.created_at.desc()).all()

        # 4. Construct Response
        # Using list comprehensions for cleaner code
        response_data = {
            "id": folder.id,
            "name": folder.name,
            "folders": [
                {
                    "id": f.id,
                    "name": f.name,
                    "created_at": f.created_at.isoformat() if f.created_at else None
                } for f in subfolders
            ],
            "files": [
                {
                    "id": file.id,
                    "name": file.name,
                    "size": file.size,
                    "mime_type": file.mime_type,
                    "created_at": file.created_at.isoformat() if file.created_at else None,
                    # Adding a direct download link is often helpful for the frontend
                } for file in files
            ]
        }
        
        # Optional: Log successful read (use debug level to avoid cluttering logs)
        logger.debug(f"User {user_id} listed contents of folder {folder_id}")

        return jsonify(response_data), 200

    except SQLAlchemyError as e:
        logger.error(f"Database error listing folder {folder_id}: {str(e)}")
        return jsonify({"error": "Database service unavailable"}), 500

    except Exception as e:
        logger.error(f"Unexpected error listing folder {folder_id}: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500