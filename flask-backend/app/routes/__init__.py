

from app.routes.auth import auth_bp
from app.routes.folders import folders_bp
from app.routes.files import files_bp
from app.routes.users import users_bp   

def register_routes(app):
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(folders_bp)
    app.register_blueprint(files_bp)
    app.register_blueprint(users_bp)    
    