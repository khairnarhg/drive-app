from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from app.models import User
import logging

# Configure logging
logger = logging.getLogger(__name__)

users_bp = Blueprint("users", __name__, url_prefix="/users")

@users_bp.route("/storage", methods=["GET"])
@jwt_required()
def storage_usage():
    user_id = get_jwt_identity()

    try:
        # User.query.get is standard, but always check if the result is None
        user = User.query.get(user_id)

        if not user:
            logger.warning(f"Storage info requested for non-existent user ID: {user_id}")
            return jsonify({"error": "User not found"}), 404

        # Calculate remaining quota safely
        # Ensure we don't return negative numbers if quota logic drifted
        remaining = max(0, user.total_quota - user.used_quota)

        return jsonify({
            "total": user.total_quota,
            "used": user.used_quota,
            "remaining": remaining,
            # Optional: Return percentage for UI progress bars
            "percentage_used": round((user.used_quota / user.total_quota) * 100, 2) if user.total_quota > 0 else 0
        }), 200

    except SQLAlchemyError as e:
        logger.error(f"Database error fetching storage for user {user_id}: {str(e)}")
        return jsonify({"error": "Database service unavailable"}), 500

    except Exception as e:
        logger.error(f"Unexpected error in storage_usage: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500