from flask import jsonify, current_app, Blueprint
import os
from app.models import FileInfo, db

get_trashed_files_bp = Blueprint("getTrashedFiles", __name__)

@get_trashed_files_bp.route("/", methods=["GET"])
def get_trashed_files():
    try:
        trashed = FileInfo.query.filter(FileInfo.delete_status == 1).all()
        files_list = [
            {
                "id": str(file.file_id),
                "name": file.file_name,
                "type": "file",
                "size": file.file_size,
                "modifiedAt": file.upload_date.isoformat() + 'Z',
                "path": "/Trash" 
            }
            for file in trashed
        ]
        return jsonify(files_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve trashed files"}), 500

