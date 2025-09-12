from app.routes.upload import upload_bp
from app.routes.get_files import get_files_bp
from app.routes.delete_single_file import delete_single_file_bp
from app.routes.download_single_file import download_single_file_bp
from app.routes.get_trashed_files import get_trashed_files_bp
from app.routes.restore_file import restore_file_bp
from app.routes.delete_permanently import delete_permanently_bp

def register_routes(app):
    app.register_blueprint(upload_bp, url_prefix="/upload")
    app.register_blueprint(get_files_bp, url_prefix="/getFiles")
    app.register_blueprint(delete_single_file_bp, url_prefix="/deleteSingleFile")
    app.register_blueprint(download_single_file_bp, url_prefix="/downloadSingleFile")
    app.register_blueprint(get_trashed_files_bp, url_prefix="/trash")
    app.register_blueprint(restore_file_bp, url_prefix="/restore")
    app.register_blueprint(delete_permanently_bp, url_prefix="/permanentlyDelete")