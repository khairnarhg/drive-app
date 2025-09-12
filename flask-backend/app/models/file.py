from app import db
from datetime import datetime

class FileInfo(db.Model):
    __tablename__ = "file_info"

    file_id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    storage_path = db.Column(db.String(512), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    folder_id = db.Column(db.Integer, db.ForeignKey("folder_info.folder_id"), nullable=True)
    remaining_space = db.Column(db.BigInteger, nullable=False)
    file_hash = db.Column(db.String(64), unique=True)
    delete_status = db.Column(db.Integer,default=0, nullable=True)
