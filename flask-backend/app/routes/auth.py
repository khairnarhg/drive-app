from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.models import User, Folder
from app import db
from app.utils.security import hash_password, verify_password
import logging

# Configure logging (optional, but recommended for production)
logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid input, JSON body required"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "User already exists"}), 409

        # Create User
        user = User(
            email=email,
            password_hash=hash_password(password)
        )

        db.session.add(user)
        # Flush to generate the user.id before commit, so we can use it for the folder
        db.session.flush()

        # Create Root Folder
        root_folder = Folder(
            name="My Drive",
            owner_id=user.id,
            parent_id=None
        )
        db.session.add(root_folder)
        
        # Commit transaction
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except IntegrityError:
        # Handles race conditions (e.g. two users registering same email at exact same time)
        db.session.rollback()
        return jsonify({"error": "User already exists"}), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during registration: {str(e)}")
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500

    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error during registration: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid input, JSON body required"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        user = User.query.filter_by(email=email).first()

        if not user or not verify_password(password, user.password_hash):
            return jsonify({"error": "Invalid credentials"}), 401

        # Ideally, convert ID to string for JWT subject
        token = create_access_token(identity=str(user.id))

        return jsonify({"access_token": token}), 200

    except SQLAlchemyError as e:
        logger.error(f"Database error during login: {str(e)}")
        return jsonify({"error": "Database service unavailable"}), 500

    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500