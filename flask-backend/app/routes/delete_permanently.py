from flask import jsonify, current_app, Blueprint
import os
from app.models import FileInfo, db

delete_permanently_bp = Blueprint("permanentlyDelete", __name__)

@delete_permanently_bp.route("/<string:file_id>",methods=["DELETE"])
def delete_permanently(file_id):
    try:
        file_to_delete = FileInfo.query.get(file_id)
        if not file_to_delete:
            return jsonify({"error": "File not found"}), 404
        
        # Define source and destination paths
        source_path = file_to_delete.storage_path
        dest_folder = current_app.config['DELETED_FOLDER']
        dest_path = os.path.join(dest_folder, file_to_delete.file_name)

        # Move the physical file
        if os.path.exists(source_path):
            os.rename(source_path, dest_path)

        # Update the database record
        file_to_delete.delete_status = 2
        file_to_delete.storage_path = dest_path # Update path to new location
        db.session.commit()
        
        return jsonify({"message": f"'{file_to_delete.file_name}' permanently deleted."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"error: {e}")
        return jsonify({"error": "Failed to permanently delete file"}), 500