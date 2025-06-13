from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas, services
from app.api import deps
from app.core import security
from app.core.config import settings
from app.db.base import get_db

router = APIRouter()

@router.post("/login/access-token", response_model=schemas.Token)
async def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = services.user.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not services.user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            subject=user.id,
            expires_delta=access_token_expires,
            email=user.email,
            roles=[user.role],
        ),
        "token_type": "bearer",
    }

@router.post("/signup", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user_signup(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user without the need to be logged in
    """
    try:
        print(f"[DEBUG] Received signup request for email: {user_in.email}")
        print(f"[DEBUG] User data: {user_in.dict()}")
        
        # Try to create the user
        user = services.user.create_user(db=db, user_in=user_in)
        print(f"[DEBUG] Successfully created user with ID: {user.id}")
        
        return user
    except ValueError as e:
        error_msg = f"[ERROR] Validation error during signup: {str(e)}"
        print(error_msg)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        import traceback
        error_msg = f"[ERROR] Unexpected error during signup: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        
        # For security, don't expose internal error details in production
        if "production" in str(settings.ENVIRONMENT).lower():
            detail = "An error occurred while creating the user."
        else:
            detail = f"An error occurred: {str(e)}"
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
        )

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
