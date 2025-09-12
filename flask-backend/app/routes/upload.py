from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import text
from werkzeug.utils import secure_filename
import os
from app.services import get_available_disk_space, calculate_hash_file
from app.models import db, FileInfo
import mimetypes

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/", methods=["POST"])
def upload_file():
    try:

        print("inside the upload file function")
        os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)

        if "files" not in request.files:
            return jsonify({"error": "No file part in req"}), 400

        files = request.files.getlist("files")

        
        result = db.session.execute(
            text("SELECT remaining_space FROM file_info ORDER BY file_id DESC LIMIT 1")
        ).fetchone()

        if result is None:
            remaining_space = current_app.config["ALLOCATED_SPACE"] * 1024 * 1024 * 1024
        else:
            remaining_space = result[0]  # fetchone() gives a tuple-like row

        new_files = []
        duplicate_files = []

        for file in files:
            file.stream.seek(0, os.SEEK_END)
            file_size = file.stream.tell()
            file.stream.seek(0)

            if remaining_space < file_size:
                return jsonify({
                    "message": f"Not enough space for filename: {file.filename}"
                }), 400
            elif file.filename == "":
                return jsonify({
                    "error": "No file has been selected || filename doesnt exist"
                }), 400
            else:
                file_hash = calculate_hash_file(file.stream)
                existing_file = FileInfo.query.filter_by(file_hash=file_hash).first()
                if existing_file:
                    duplicate_files.append(file)
                    continue

                filename = secure_filename(file.filename)
                storage_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
                file.save(storage_path)
                remaining_space = remaining_space - file_size

                file_type, _ = mimetypes.guess_type(filename)
                if file_type is None:
                    file_type = "unknown"

                new_file = FileInfo(
                    file_name=filename,
                    file_type=file_type,
                    file_size=file_size,
                    storage_path=storage_path,
                    folder_id=None,
                    remaining_space=remaining_space,
                    file_hash=file_hash,
                )

                new_files.append(new_file)

        db.session.add_all(new_files)
        db.session.commit()

        if len(duplicate_files) > 0:
            return jsonify({
                "message": "Files uploaded successfully, duplicate files not uploaded"
            })
        else:
            return jsonify({
                "message": "Files uploaded successfully without any duplicates"
            })
    except Exception as e:
        print(f"Err fetching files:{e}")
        return jsonify({"message":"an unknown err occured"}), 500
