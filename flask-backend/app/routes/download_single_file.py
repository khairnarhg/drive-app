from flask import jsonify, current_app, Blueprint, send_file
import os
from app.models import FileInfo, db

download_single_file_bp = Blueprint("downloadSingleFile", __name__)

@download_single_file_bp.route("/<string:file_id>", methods=["GET"])
def download_single_file(file_id):
    try:
        # Find the file record in the database
        file_record = FileInfo.query.get(file_id)

        if not file_record:
            return jsonify({"error": "File not found in database"}), 404

        # Check if the physical file exists at the stored path
        if not os.path.exists(file_record.storage_path):
             return jsonify({"error": "File not found on server storage"}), 404
        
        # Use send_file to securely send the file as an attachment
        return send_file(
            file_record.storage_path,
            as_attachment=True,
            download_name=file_record.file_name # This sets the filename in the browser's download prompt
        )

    except Exception as e:
        print(f"Error downloading file: {e}")
        return jsonify({"error": "An unexpected error occurred during file download"}), 500
