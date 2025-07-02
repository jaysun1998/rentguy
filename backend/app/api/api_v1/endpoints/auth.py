from datetime import timedelta
from typing import Any
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app import models, schemas, services
from app.api import deps
from app.core import security
from app.core.config import settings
from app.db.base import get_db
from app.schemas.google_auth import GoogleAuthRequest, GoogleAuthResponse

logger = logging.getLogger(__name__)

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

@router.post("/google", response_model=GoogleAuthResponse)
async def google_auth(
    *,
    db: Session = Depends(get_db),
    google_auth_data: GoogleAuthRequest,
) -> Any:
    """
    Authenticate user with Google OAuth token
    """
    try:
        # Verify the Google token
        CLIENT_ID = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        if not CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google authentication not configured"
            )
            
        idinfo = id_token.verify_oauth2_token(
            google_auth_data.token, 
            google_requests.Request(), 
            CLIENT_ID
        )

        # Extract user information from the token
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        google_id = idinfo.get('sub')

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to get email from Google token"
            )

        # Check if user exists
        user = services.user.get_by_email(db, email=email)
        
        if not user:
            # Create new user if doesn't exist
            user_in = schemas.UserCreate(
                email=email,
                password="google_oauth_user",  # Placeholder password for Google users
                first_name=first_name,
                last_name=last_name,
            )
            user = services.user.create_user(db, user_in=user_in)
            logger.info(f"Created new user from Google auth: {email}")

        if not services.user.is_active(user):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Inactive user"
            )

        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            subject=user.id,
            expires_delta=access_token_expires,
            email=user.email,
            roles=[user.role],
        )

        return GoogleAuthResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=str(user.id),
            email=user.email
        )

    except ValueError as e:
        # Invalid token
        logger.error(f"Invalid Google token: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google token"
        )
    except Exception as e:
        logger.error(f"Google authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
