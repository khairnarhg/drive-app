from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from sqlalchemy import text
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    # init database
    db.init_app(app)

    with app.app_context():
        try:
            db.session.execute(text("SELECT 1"))
            print("[INFO] Database connected successfully")
        except Exception as e:
            print(f"[ERROR] Database connection failed: {e}")

    # import models so tables are registered
    from app import models  

    from app import services

    # register routes
    from app.routes import register_routes
    register_routes(app)

    return app
