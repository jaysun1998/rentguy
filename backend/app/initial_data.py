import logging
from typing import Any

from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.config import settings
from app.db import base  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    # Base.metadata.create_all(bind=engine)
    
    # Create first superuser
    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            first_name=settings.FIRST_SUPERUSER_FIRST_NAME,
            last_name=settings.FIRST_SUPERUSER_LAST_NAME,
            is_superuser=True,
        )
        user = crud.user.create(db, obj_in=user_in)  # noqa: F841
        logger.info(f"Created first superuser: {settings.FIRST_SUPERUSER_EMAIL}")
    else:
        logger.info(f"Superuser already exists: {settings.FIRST_SUPERUSER_EMAIL}")
    
    return None
