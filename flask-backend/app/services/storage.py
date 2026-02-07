import os
import uuid

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
