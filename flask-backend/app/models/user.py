from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    total_quota = db.Column(db.BigInteger, default=100 * 1024 * 1024)  # 100 MB
    used_quota = db.Column(db.BigInteger, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
