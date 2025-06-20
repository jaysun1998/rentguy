"""Tests for security functionality."""

import pytest
from datetime import timedelta

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token
)
from app.core.config import settings


class TestPasswordHashing:
    """Test password hashing functionality."""
    
    def test_password_hash_and_verify(self):
        """Test password hashing and verification."""
        password = "TestPassword123"
        
        # Hash the password
        hashed = get_password_hash(password)
        
        # Verify the correct password
        assert verify_password(password, hashed) is True
        
        # Verify an incorrect password
        assert verify_password("WrongPassword", hashed) is False
    
    def test_password_hash_unique(self):
        """Test that password hashes are unique (salted)."""
        password = "SamePassword123"
        
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokens:
    """Test JWT token functionality."""
    
    def test_create_access_token(self):
        """Test creating an access token."""
        subject = "123"
        email = "test@example.com"
        roles = ["user"]
        
        token = create_access_token(
            subject=subject,
            email=email,
            roles=roles
        )
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_access_token_with_expiry(self):
        """Test creating an access token with custom expiry."""
        subject = "456"
        email = "test2@example.com"
        roles = ["admin"]
        expires_delta = timedelta(minutes=30)
        
        token = create_access_token(
            subject=subject,
            email=email,
            roles=roles,
            expires_delta=expires_delta
        )
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_verify_valid_token(self):
        """Test verifying a valid token."""
        subject = "789"
        email = "verify@example.com"
        roles = ["user"]
        
        # Create a token
        token = create_access_token(
            subject=subject,
            email=email,
            roles=roles
        )
        
        # Verify the token
        payload = verify_token(token)
        
        assert payload is not None
        assert payload.sub == subject
        assert payload.email == email
        assert payload.roles == roles
    
    def test_verify_invalid_token(self):
        """Test verifying an invalid token."""
        invalid_token = "invalid.token.here"
        
        payload = verify_token(invalid_token)
        
        assert payload is None
    
    def test_verify_expired_token(self):
        """Test verifying an expired token."""
        subject = "expired"
        email = "expired@example.com"
        roles = ["user"]
        
        # Create a token that expires immediately
        token = create_access_token(
            subject=subject,
            email=email,
            roles=roles,
            expires_delta=timedelta(seconds=-1)  # Already expired
        )
        
        # Verify the expired token
        payload = verify_token(token)
        
        assert payload is None
    
    def test_token_contains_required_fields(self):
        """Test that tokens contain all required fields."""
        subject = "fields_test"
        email = "fields@example.com"
        roles = ["user", "admin"]
        
        token = create_access_token(
            subject=subject,
            email=email,
            roles=roles
        )
        
        payload = verify_token(token)
        
        assert payload is not None
        assert payload.sub is not None
        assert payload.email is not None
        assert payload.roles is not None
        assert payload.exp is not None
        
        assert payload.sub == subject
        assert payload.email == email
        assert payload.roles == roles