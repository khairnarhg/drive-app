from dotenv import load_dotenv
from datetime import timedelta
import os

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LOCAL_STORAGE_PATH = os.getenv("LOCAL_STORAGE_PATH")
    DELETED_FOLDER = os.getenv("DELETED_FOLDER")
    ALLOCATED_SPACE_GB = int(os.getenv("ALLOCATED_SPACE_GB", 1))
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRED = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400)))
