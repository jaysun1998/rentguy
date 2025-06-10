import logging
from typing import Any

from sqlalchemy.orm import Session
from sqlalchemy import text

from app import crud, models, schemas
from app.core.config import settings
from app.db.base import Base, engine, SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    """
    Initialize the database by creating tables and the first superuser.
    """
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create first superuser if it doesn't exist
        user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
        if not user:
            # Use a stronger default password if the configured one doesn't meet requirements
            password = settings.FIRST_SUPERUSER_PASSWORD
            if not any(c.isupper() for c in password) or not any(c.isdigit() for c in password):
                password = "AdminPassword123!"
                
            user_in = schemas.UserCreate(
                email=settings.FIRST_SUPERUSER_EMAIL,
                password=password,
                first_name=settings.FIRST_SUPERUSER_FIRST_NAME,
                last_name=settings.FIRST_SUPERUSER_LAST_NAME,
                role="admin",
                is_active=True,
            )
            user = crud.user.create(db, obj_in=user_in)
            logger.info(f"Created first superuser: {settings.FIRST_SUPERUSER_EMAIL}")
        else:
            logger.info(f"Superuser already exists: {settings.FIRST_SUPERUSER_EMAIL}")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise
    finally:
        db.close()

def check_db_connected() -> bool:
    """
    Check if the database is connected.
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False
    finally:
        db.close()
