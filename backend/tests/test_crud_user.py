"""Tests for user CRUD operations."""

import pytest
from sqlalchemy.orm import Session

from app import schemas
from app.crud.crud_user import user
from app.models.user import User
from app.core.security import verify_password


class TestUserCRUD:
    """Test user CRUD operations."""
    
    def test_create_user(self, test_db: Session):
        """Test creating a user."""
        user_data = schemas.UserCreate(
            email="testuser@example.com",
            password="TestPassword123",
            first_name="Test",
            last_name="User"
        )
        
        db_user = user.create(db=test_db, obj_in=user_data)
        
        assert db_user.email == user_data.email
        assert db_user.first_name == user_data.first_name
        assert db_user.last_name == user_data.last_name
        assert verify_password(user_data.password, db_user.hashed_password)
        assert db_user.is_active
        assert db_user.role == "user"
    
    def test_get_user_by_email(self, test_db: Session):
        """Test getting a user by email."""
        # Create a user first
        user_data = schemas.UserCreate(
            email="findme@example.com",
            password="FindMePassword123",
            first_name="Find",
            last_name="Me"
        )
        created_user = user.create(db=test_db, obj_in=user_data)
        
        # Find the user by email
        found_user = user.get_by_email(db=test_db, email=user_data.email)
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == user_data.email
    
    def test_get_user_by_email_not_found(self, test_db: Session):
        """Test getting a user by email when not found."""
        found_user = user.get_by_email(db=test_db, email="nonexistent@example.com")
        assert found_user is None
    
    def test_authenticate_user_valid(self, test_db: Session):
        """Test authenticating a user with valid credentials."""
        user_data = schemas.UserCreate(
            email="auth@example.com",
            password="AuthPassword123",
            first_name="Auth",
            last_name="User"
        )
        user.create(db=test_db, obj_in=user_data)
        
        authenticated_user = user.authenticate(
            db=test_db, 
            email=user_data.email, 
            password=user_data.password
        )
        
        assert authenticated_user is not None
        assert authenticated_user.email == user_data.email
    
    def test_authenticate_user_invalid_email(self, test_db: Session):
        """Test authenticating a user with invalid email."""
        authenticated_user = user.authenticate(
            db=test_db, 
            email="invalid@example.com", 
            password="SomePassword123"
        )
        
        assert authenticated_user is None
    
    def test_authenticate_user_invalid_password(self, test_db: Session):
        """Test authenticating a user with invalid password."""
        user_data = schemas.UserCreate(
            email="wrongpass@example.com",
            password="CorrectPassword123",
            first_name="Wrong",
            last_name="Pass"
        )
        user.create(db=test_db, obj_in=user_data)
        
        authenticated_user = user.authenticate(
            db=test_db, 
            email=user_data.email, 
            password="WrongPassword123"
        )
        
        assert authenticated_user is None
    
    def test_update_user(self, test_db: Session):
        """Test updating a user."""
        # Create a user first
        user_data = schemas.UserCreate(
            email="update@example.com",
            password="UpdatePassword123",
            first_name="Update",
            last_name="User"
        )
        created_user = user.create(db=test_db, obj_in=user_data)
        
        # Update the user
        update_data = schemas.UserUpdate(
            first_name="Updated",
            last_name="UserUpdated"
        )
        updated_user = user.update(db=test_db, db_obj=created_user, obj_in=update_data)
        
        assert updated_user.id == created_user.id
        assert updated_user.first_name == "Updated"
        assert updated_user.last_name == "UserUpdated"
        assert updated_user.email == user_data.email  # Should remain unchanged
    
    def test_update_user_password(self, test_db: Session):
        """Test updating a user's password."""
        # Create a user first
        user_data = schemas.UserCreate(
            email="passupdate@example.com",
            password="OldPassword123",
            first_name="Pass",
            last_name="Update"
        )
        created_user = user.create(db=test_db, obj_in=user_data)
        old_password_hash = created_user.hashed_password
        
        # Update the password
        update_data = {"password": "NewPassword123"}
        updated_user = user.update(db=test_db, db_obj=created_user, obj_in=update_data)
        
        assert updated_user.hashed_password != old_password_hash
        assert verify_password("NewPassword123", updated_user.hashed_password)
        assert not verify_password("OldPassword123", updated_user.hashed_password)
    
    def test_is_active(self, test_db: Session):
        """Test checking if a user is active."""
        user_data = schemas.UserCreate(
            email="active@example.com",
            password="ActivePassword123",
            first_name="Active",
            last_name="User"
        )
        created_user = user.create(db=test_db, obj_in=user_data)
        
        assert user.is_active(created_user) is True
    
    def test_is_superuser(self, test_db: Session):
        """Test checking if a user is a superuser."""
        # Create a regular user
        user_data = schemas.UserCreate(
            email="regular@example.com",
            password="RegularPassword123",
            first_name="Regular",
            last_name="User"
        )
        regular_user = user.create(db=test_db, obj_in=user_data)
        
        assert user.is_superuser(regular_user) is False
        
        # Create an admin user by updating role
        admin_user = user.update(
            db=test_db, 
            db_obj=regular_user, 
            obj_in={"role": "admin"}
        )
        
        assert user.is_superuser(admin_user) is True