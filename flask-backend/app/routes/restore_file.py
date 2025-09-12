from flask import jsonify, current_app, Blueprint
import os
from app.models import FileInfo, db

restore_file_bp = Blueprint("restore", __name__)

@restore_file_bp.route("/<string:file_id>", methods=["POST"])
def restore_file(file_id):
    try:
        file_to_restore = FileInfo.query.get(file_id)
        if not file_to_restore:
            return jsonify({"error": "File not found"}), 404
        
        file_to_restore.delete_status = 0
        db.session.commit()
        return jsonify({"message": f"'{file_to_restore.file_name}' restored successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to restore file"}), 500