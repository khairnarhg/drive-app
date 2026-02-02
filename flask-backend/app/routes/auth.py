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

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        password = data.get("password")

        if not all([first_name, last_name, email, password]):
            return jsonify({"error": "All fields are required"}), 400

        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "User already exists"}), 409

        # 1️⃣ Create user
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=hash_password(password)
        )
        db.session.add(user)
        db.session.flush()  # user.id available

        # 2️⃣ Create root folder
        root_folder = Folder(
            name="My Drive",
            owner_id=user.id,
            parent_id=None
        )
        db.session.add(root_folder)
        db.session.flush()  # root_folder.id available

        # 3️⃣ Link root folder to user
        user.root_folder_id = root_folder.id

        # 4️⃣ Commit everything together
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "User already exists"}), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during registration: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500

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


@auth_bp.route("/profile", methods=["GET"])
def profile():
    try:
        # Assuming user is authenticated and user_id is available via JWT
        from flask_jwt_extended import get_jwt_identity, jwt_required

        @jwt_required()
        def get_profile():
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                return jsonify({"error": "User not found"}), 404

            user_data = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "root_folder_id": user.root_folder_id,
            }

            return jsonify({"user": user_data}), 200

        return get_profile()

    except SQLAlchemyError as e:
        logger.error(f"Database error during profile retrieval: {str(e)}")
        return jsonify({"error": "Database service unavailable"}), 500

    except Exception as e:
        logger.error(f"Unexpected error during profile retrieval: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500