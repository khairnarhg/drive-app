import os


#D:\IISER 25-26\drive-application\deleted_folder
class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:Hk%402552004@localhost:5432/fcrit_filesystem"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = r"D:\IISER 25-26\drive-application\allocated_folder"
    DELETED_FOLDER = r"D:\IISER 25-26\drive-application\deleted_folder"
    ALLOCATED_SPACE = 1

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
