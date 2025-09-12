from flask import jsonify, current_app, Blueprint
from app.models import FileInfo
from zoneinfo import ZoneInfo

get_files_bp= Blueprint("getFiles", __name__)

@get_files_bp.route("/", methods=["GET"])
def get_files():
    try:
        files_from_db = FileInfo.query.filter(FileInfo.delete_status == 0).all()
        ist_zone = ZoneInfo("Asia/Kolkata")

        files_list = []
        for file in files_from_db:
            utc_time = file.upload_date.replace(tzinfo=ZoneInfo("UTC"))
            ist_time = utc_time.astimezone(ist_zone)
            files_list.append({
                "id": str(file.file_id), # Ensure ID is a string
                "name": file.file_name,
                "type": file.file_type if (file.file_type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document")  else "docx",  # Assuming all are files for now, as requested
                "size": file.file_size,
                "modifiedAt": file.upload_date.isoformat() + 'Z', # Convert datetime to ISO string
                "path": "/My Drive" # Using a static path as requested
            })
            
        
        
        return jsonify(files_list), 200
    except Exception as e:
        print(f"Error fetching files: {e}")
        return jsonify({"error":"Failed to retrieve files"}), 500
