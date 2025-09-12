import hashlib

def calculate_hash_file(file_stream, chunk_size=8192):

    hasher = hashlib.sha256()
    file_stream.seek(0)  
    while chunk := file_stream.read(chunk_size):
        hasher.update(chunk)
    file_stream.seek(0)  
    return hasher.hexdigest()