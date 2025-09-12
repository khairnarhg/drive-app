from app import db
from datetime import datetime

class FolderInfo(db.Model):
    __tablename__ = "folder_info"

    folder_id = db.Column(db.Integer, primary_key=True)
    folder_name = db.Column(db.String(255), nullable=False)
    parent_folder_id = db.Column(db.Integer, db.ForeignKey("folder_info.folder_id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationship
    files = db.relationship("FileInfo", backref="folder", lazy=True)
