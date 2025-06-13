import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

def init_db() -> None:
    """Initialize the database with the first superuser."""
    db = SessionLocal()
    try:
        # Check if superuser already exists
        user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
        if not user:
            # Create superuser
            user = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                first_name=settings.FIRST_SUPERUSER_FIRST_NAME,
                last_name=settings.FIRST_SUPERUSER_LAST_NAME,
                is_superuser=True,
                is_active=True,
            )
            db.add(user)
            db.commit()
            logger.info("Superuser created successfully")
        else:
            logger.info("Superuser already exists")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
