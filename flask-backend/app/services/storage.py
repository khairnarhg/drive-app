import os
import uuid

class LocalStorageService:
    def __init__(self, base_path):
        self.base_path = base_path

    def save(self, file_stream):
        key = uuid.uuid4().hex
        path = os.path.join(self.base_path, key)

        with open(path, "wb") as f:
            f.write(file_stream.read())

        return key
