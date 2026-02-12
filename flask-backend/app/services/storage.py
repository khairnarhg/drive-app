import os
import uuid
from io import BytesIO

class LocalStorageService:
    def __init__(self, base_path):
        if not base_path:
            raise ValueError("LOCAL_STORAGE_PATH is not set")
        self.base_path = os.path.abspath(base_path)
        os.makedirs(self.base_path, exist_ok=True)

    def save(self, file_stream):
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

    def save(self, file_stream):
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


def get_storage_service(config):
    """
    Factory function to get the appropriate storage service based on config.
    Returns LocalStorageService if R2 config is not set, otherwise S3StorageService.
    """
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
    else:
        local_path = config.get("LOCAL_STORAGE_PATH")
        if not local_path:
            raise ValueError("Either R2 config or LOCAL_STORAGE_PATH must be set")
        return LocalStorageService(local_path)
