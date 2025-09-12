from flask import jsonify, current_app, Blueprint
import os
from app.models import FileInfo, db

delete_single_file_bp = Blueprint("deleteSingleFile", __name__)

@delete_single_file_bp.route("/<string:file_id>", methods=["DELETE"])
def delete_single_file(file_id):
    try:
        # Find the file record in the database by its primary key
        file_to_trash = FileInfo.query.get(file_id)

        if not file_to_trash:
            return jsonify({"error": "File not found"}), 404

        # Update the delete_status to 1 (marking it as "in trash")
        file_to_trash.delete_status = 1
        
        # Commit the change to the database
        db.session.commit()

        return jsonify({"message": f"'{file_to_trash.file_name}' was moved to trash."}), 200

    except Exception as e:
        # Rollback the session in case of a database error
        db.session.rollback() 
        print(f"Error moving file to trash: {e}")
        return jsonify({"error": "Failed to move file to trash due to a server error"}), 500
