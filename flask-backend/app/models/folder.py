from app import db
from datetime import datetime

class Folder(db.Model):
    __tablename__ = "folders"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("folders.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    children = db.relationship(
        "Folder",
        backref=db.backref("parent", remote_side=[id]),
        lazy=True,
    )

    files = db.relationship("File", backref="folder", lazy=True)
