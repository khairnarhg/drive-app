import os
import tempfile
import uuid
from io import BytesIO

class LocalStorageService:
    def __init__(self, base_path):
        if not base_path:
            raise ValueError("LOCAL_STORAGE_PATH is not set")
        self.base_path = os.path.abspath(base_path)
        os.makedirs(self.base_path, exist_ok=True)

    def save(self, file_stream, filename=None):
        key = uuid.uuid4().hex
        path = os.path.join(self.base_path, key)

        with open(path, "wb") as f:
            f.write(file_stream.read())

        return key

    def get_file_path(self, storage_key):
        return os.path.join(self.base_path, storage_key)

    def delete(self, storage_key):
        path = self.get_file_path(storage_key)
        if os.path.exists(path):
            os.remove(path)


class S3StorageService:
    """S3-compatible storage service (works with Cloudflare R2, AWS S3, etc.)"""
    def __init__(self, endpoint_url, access_key_id, secret_access_key, bucket_name):
        import boto3
        from botocore.config import Config

        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            config=Config(signature_version='s3v4')
        )

    def save(self, file_stream, filename=None):
        key = uuid.uuid4().hex
        file_stream.seek(0)
        self.s3_client.upload_fileobj(file_stream, self.bucket_name, key)
        return key

    def get_file_path(self, storage_key):
        # For S3, we return a presigned URL or the key itself
        # The download route will handle fetching from S3
        return storage_key

    def delete(self, storage_key):
        self.s3_client.delete_object(Bucket=self.bucket_name, Key=storage_key)

    def get_download_url(self, storage_key, expires_in=3600):
        """Generate a presigned URL for downloading (valid for expires_in seconds)"""
        return self.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket_name, 'Key': storage_key},
            ExpiresIn=expires_in
        )


class CloudinaryStorageService:
    """Cloudinary storage for files (raw uploads). Free tier supported."""
    def __init__(self, cloud_name, api_key, api_secret):
        import cloudinary
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        self.cloud_name = cloud_name
        self._api_key = api_key
        self._api_secret = api_secret

    def save(self, file_stream, filename=None):
        import cloudinary.uploader
        file_stream.seek(0)
        # Cloudinary rejects some extensions (e.g. .bin). Use original extension for temp file.
        suffix = ".dat"
        if filename:
            ext = os.path.splitext(filename)[1].strip().lower()
            if ext and len(ext) <= 10 and ext.replace(".", "").isalnum():
                suffix = ext if ext.startswith(".") else f".{ext}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_stream.read())
            tmp.flush()
            tmp_path = tmp.name
        try:
            result = cloudinary.uploader.upload(
                tmp_path,
                resource_type="raw",
                use_filename=False,
                unique_filename=True
            )
            return result["public_id"]
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    def get_file_path(self, storage_key):
        return storage_key  # No local path; download via URL

    def delete(self, storage_key):
        import cloudinary.uploader
        cloudinary.uploader.destroy(storage_key, resource_type="raw")

    def get_download_url(self, storage_key, expires_in=3600):
        """Build a signed URL for the raw file to avoid 'untrusted' errors."""
        from cloudinary.utils import cloudinary_url
        # Use sign_url=True to generate authenticated signed URLs
        url, _ = cloudinary_url(
            storage_key, 
            resource_type="raw",
            sign_url=True,
            secure=True
        )
        return url
    
    def download_file_content(self, storage_key):
        """Download file content directly using authenticated Cloudinary API."""
        import cloudinary.api
        import requests
        
        # Get signed URL
        download_url = self.get_download_url(storage_key)
        
        # Download using requests (signed URL includes authentication)
        response = requests.get(download_url, timeout=60)
        response.raise_for_status()
        return response.content


def get_storage_service(config):
    """
    Factory: Cloudinary > R2 > Local (first with all required vars wins).
    """
    cloud_name = config.get("CLOUDINARY_CLOUD_NAME")
    cloud_key = config.get("CLOUDINARY_API_KEY")
    cloud_secret = config.get("CLOUDINARY_API_SECRET")

    if cloud_name and cloud_key and cloud_secret:
        return CloudinaryStorageService(
            cloud_name=cloud_name,
            api_key=cloud_key,
            api_secret=cloud_secret
        )

    r2_endpoint = config.get("R2_ENDPOINT_URL")
    r2_access_key = config.get("R2_ACCESS_KEY_ID")
    r2_secret_key = config.get("R2_SECRET_ACCESS_KEY")
    r2_bucket = config.get("R2_BUCKET_NAME")

    if r2_endpoint and r2_access_key and r2_secret_key and r2_bucket:
        return S3StorageService(
            endpoint_url=r2_endpoint,
            access_key_id=r2_access_key,
            secret_access_key=r2_secret_key,
            bucket_name=r2_bucket
        )

    local_path = config.get("LOCAL_STORAGE_PATH")
    if not local_path:
        raise ValueError(
            "Set CLOUDINARY_* or R2_* or LOCAL_STORAGE_PATH in the environment"
        )
    return LocalStorageService(local_path)
