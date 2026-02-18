from dotenv import load_dotenv
from datetime import timedelta
import os
from urllib.parse import urlparse, unquote

load_dotenv()


def _cloudinary_from_url():
    """Parse CLOUDINARY_URL (cloudinary://api_key:api_secret@cloud_name) into components."""
    url = os.getenv("CLOUDINARY_URL")
    if not url or not url.startswith("cloudinary://"):
        return None, None, None
    try:
        parsed = urlparse(url)
        cloud_name = parsed.hostname or ""
        api_key = unquote(parsed.username or "")
        api_secret = unquote(parsed.password or "")
        return (cloud_name, api_key, api_secret) if (cloud_name and api_key and api_secret) else (None, None, None)
    except Exception:
        return None, None, None


_cn_url_cloud, _cn_url_key, _cn_url_secret = _cloudinary_from_url()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LOCAL_STORAGE_PATH = os.getenv("LOCAL_STORAGE_PATH")
    # Cloudinary (from separate vars or from CLOUDINARY_URL)
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME") or _cn_url_cloud
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY") or _cn_url_key
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET") or _cn_url_secret
    # Cloudflare R2 (S3-compatible) settings
    R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
    R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
    R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
    ALLOCATED_SPACE_GB = int(os.getenv("ALLOCATED_SPACE_GB", 1))
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRED = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400)))
