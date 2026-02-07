from app import db
from datetime import datetime

class File(db.Model):
    __tablename__ = "files"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=False)
    size = db.Column(db.BigInteger, nullable=False)
    mime_type = db.Column(db.String(255), nullable=False)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    folder_id = db.Column(db.Integer, db.ForeignKey("folders.id"), nullable=True)

    storage_key = db.Column(db.String(512), nullable=True, unique=True)  # NULL when status=DELETED
    content_hash = db.Column(db.String(64), index=True)

    status = db.Column(
        db.Enum("ACTIVE", "TRASH", "DELETED", name="file_status"),
        default="ACTIVE"
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
