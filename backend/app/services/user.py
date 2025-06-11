from typing import Optional, List

from sqlalchemy.orm import Session

from app import models, schemas, crud
from app.core.security import get_password_hash, verify_password

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return crud.user.get(db, id=user_id)

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return crud.user.get_by_email(db, email=email)

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return crud.user.get_multi(db, skip=skip, limit=limit)

def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    """Create a new user with hashed password."""
    # Check if user with this email already exists
    db_user = crud.user.get_by_email(db, email=user_in.email)
    if db_user:
        raise ValueError("User with this email already exists")
    
    # Create new user using CRUD method (which handles password hashing)
    return crud.user.create(db, obj_in=user_in)

def update_user(
    db: Session, db_user: models.User, user_in: schemas.UserUpdate
) -> models.User:
    """Update a user's information."""
    user_data = user_in.dict(exclude_unset=True)
    
    # Handle password update
    if "password" in user_data:
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
    
    return crud.user.update(db, db_obj=db_user, obj_in=user_data)

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """Authenticate a user with email and password."""
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def is_active(user: models.User) -> bool:
    """Check if a user is active."""
    return user.is_active

def is_superuser(user: models.User) -> bool:
    """Check if a user is a superuser."""
    return user.role == "admin"

def create_initial_superuser(db: Session) -> models.User:
    """Create initial superuser if no users exist."""
    from app.core.config import settings
    
    # Check if any users exist
    if crud.user.get_multi(db, limit=1):
        return None
    
    # Create superuser
    user_in = schemas.UserCreate(
        email=settings.FIRST_SUPERUSER_EMAIL,
        password=settings.FIRST_SUPERUSER_PASSWORD,
        first_name=settings.FIRST_SUPERUSER_FIRST_NAME,
        last_name=settings.FIRST_SUPERUSER_LAST_NAME,
        role="admin",
        is_active=True,
    )
    
    return create_user(db, user_in=user_in)
