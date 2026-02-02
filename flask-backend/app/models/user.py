from app import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    root_folder_id = db.Column(
        db.Integer,
        db.ForeignKey("folders.id"),
        nullable=True
    )

    total_quota = db.Column(db.BigInteger, default=100 * 1024 * 1024)
    used_quota = db.Column(db.BigInteger, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
