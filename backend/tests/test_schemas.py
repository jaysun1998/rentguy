"""Tests for Pydantic schemas."""

import pytest
from pydantic import ValidationError
from datetime import datetime

from app import schemas


class TestUserSchemas:
    """Test User-related schemas."""
    
    def test_user_create_valid(self):
        """Test creating a valid UserCreate schema."""
        user_data = {
            "email": "valid@example.com",
            "password": "ValidPassword123",
            "first_name": "Valid",
            "last_name": "User"
        }
        
        user_schema = schemas.UserCreate(**user_data)
        
        assert user_schema.email == user_data["email"]
        assert user_schema.password == user_data["password"]
        assert user_schema.first_name == user_data["first_name"]
        assert user_schema.last_name == user_data["last_name"]
        assert user_schema.role == schemas.UserRole.USER
        assert user_schema.is_active is True
    
    def test_user_create_invalid_email(self):
        """Test UserCreate with invalid email."""
        user_data = {
            "email": "invalid-email",
            "password": "ValidPassword123",
            "first_name": "Invalid",
            "last_name": "Email"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            schemas.UserCreate(**user_data)
        
        errors = exc_info.value.errors()
        assert any(error["loc"] == ("email",) for error in errors)
    
    def test_user_create_short_password(self):
        """Test UserCreate with password too short."""
        user_data = {
            "email": "short@example.com",
            "password": "short",
            "first_name": "Short",
            "last_name": "Password"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            schemas.UserCreate(**user_data)
        
        errors = exc_info.value.errors()
        assert any(error["loc"] == ("password",) for error in errors)
    
    def test_user_create_weak_password(self):
        """Test UserCreate with weak password."""
        user_data = {
            "email": "weak@example.com",
            "password": "weakpassword",  # No uppercase or digits
            "first_name": "Weak",
            "last_name": "Password"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            schemas.UserCreate(**user_data)
        
        errors = exc_info.value.errors()
        assert any(error["loc"] == ("password",) for error in errors)
    
    def test_user_create_password_with_uppercase(self):
        """Test UserCreate with password containing uppercase."""
        user_data = {
            "email": "upper@example.com",
            "password": "Passwordwithuppercase",
            "first_name": "Upper",
            "last_name": "Case"
        }
        
        user_schema = schemas.UserCreate(**user_data)
        assert user_schema.password == user_data["password"]
    
    def test_user_create_password_with_digit(self):
        """Test UserCreate with password containing digit."""
        user_data = {
            "email": "digit@example.com",
            "password": "passwordwithdigit123",
            "first_name": "With",
            "last_name": "Digit"
        }
        
        user_schema = schemas.UserCreate(**user_data)
        assert user_schema.password == user_data["password"]
    
    def test_user_create_empty_names(self):
        """Test UserCreate with empty names."""
        user_data = {
            "email": "empty@example.com",
            "password": "EmptyNames123",
            "first_name": "",
            "last_name": ""
        }
        
        with pytest.raises(ValidationError) as exc_info:
            schemas.UserCreate(**user_data)
        
        errors = exc_info.value.errors()
        assert any(error["loc"] == ("first_name",) for error in errors)
        assert any(error["loc"] == ("last_name",) for error in errors)
    
    def test_user_update_partial(self):
        """Test UserUpdate with partial data."""
        update_data = {
            "first_name": "Updated"
        }
        
        user_update = schemas.UserUpdate(**update_data)
        
        assert user_update.first_name == "Updated"
        assert user_update.last_name is None
        assert user_update.email is None
    
    def test_user_update_password(self):
        """Test UserUpdate with password."""
        update_data = {
            "password": "NewPassword123"
        }
        
        user_update = schemas.UserUpdate(**update_data)
        
        assert user_update.password == "NewPassword123"
    
    def test_user_response_schema(self):
        """Test User response schema."""
        user_data = {
            "id": 1,
            "email": "response@example.com",
            "first_name": "Response",
            "last_name": "User",
            "role": schemas.UserRole.USER,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        user_schema = schemas.User(**user_data)
        
        assert user_schema.id == 1
        assert user_schema.email == "response@example.com"
        assert user_schema.role == schemas.UserRole.USER


class TestTokenSchemas:
    """Test Token-related schemas."""
    
    def test_token_schema(self):
        """Test Token schema."""
        token_data = {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }
        
        token_schema = schemas.Token(**token_data)
        
        assert token_schema.access_token == token_data["access_token"]
        assert token_schema.token_type == token_data["token_type"]
    
    def test_token_data_schema(self):
        """Test TokenData schema."""
        token_data = {
            "email": "token@example.com"
        }
        
        token_data_schema = schemas.TokenData(**token_data)
        
        assert token_data_schema.email == token_data["email"]
    
    def test_token_data_schema_optional_email(self):
        """Test TokenData schema with optional email."""
        token_data_schema = schemas.TokenData()
        
        assert token_data_schema.email is None


class TestMaintenanceSchemas:
    """Test Maintenance-related schemas."""
    
    def test_maintenance_request_create(self):
        """Test MaintenanceRequestCreate schema."""
        maintenance_data = {
            "unit_id": 1,
            "title": "Broken sink",
            "description": "The kitchen sink is leaking",
            "priority": "high",
            "category": "plumbing"
        }
        
        maintenance_schema = schemas.MaintenanceRequestCreate(**maintenance_data)
        
        assert maintenance_schema.unit_id == 1
        assert maintenance_schema.title == "Broken sink"
        assert maintenance_schema.description == "The kitchen sink is leaking"
        assert maintenance_schema.priority == "high"
        assert maintenance_schema.category == "plumbing"
    
    def test_maintenance_request_create_required_fields(self):
        """Test MaintenanceRequestCreate with missing required fields."""
        maintenance_data = {
            "title": "Incomplete request"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            schemas.MaintenanceRequestCreate(**maintenance_data)
        
        errors = exc_info.value.errors()
        field_errors = [error["loc"][0] for error in errors]
        assert "unit_id" in field_errors
        assert "description" in field_errors