import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.config import settings
from app.crud import user as crud_user
from app.schemas.user import UserCreate


# Authentication Endpoint Tests - Following BDD Style
describe = pytest.mark.describe
it = pytest.mark.it

@describe("Authentication Endpoints")
class TestAuthentication:
    
    @it("allows a user to sign up with valid credentials")
    def test_signup_success(self, client, test_db):
        # Given: A new user with valid data
        user_data = {
            "email": "newuser@example.com",
            "password": "Password123",  # Meets validation (uppercase, digit)
            "first_name": "New",
            "last_name": "User"
        }
        
        # When: Signup request is made
        response = client.post(
            f"{settings.API_V1_STR}/auth/signup",
            json=user_data
        )
        
        # Then: User is created successfully
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["email"] == user_data["email"]
        assert response.json()["first_name"] == user_data["first_name"]
        assert response.json()["last_name"] == user_data["last_name"]
        assert "id" in response.json()
        assert "is_active" in response.json()
        assert response.json()["is_active"] == True
        assert "hashed_password" not in response.json()
        
        # And: The user can be found in the database
        db_user = crud_user.get_by_email(test_db, email=user_data["email"])
        assert db_user is not None
        assert db_user.email == user_data["email"]
    
    @it("rejects signup with duplicate email")
    def test_signup_duplicate_email(self, client, test_db):
        # Given: An existing user
        user_data = {
            "email": "duplicate@example.com",
            "password": "Password123",
            "first_name": "Duplicate",
            "last_name": "User"
        }
        user_in = UserCreate(**user_data)
        crud_user.create(db=test_db, obj_in=user_in)
        
        # When: Another signup attempt is made with the same email
        response = client.post(
            f"{settings.API_V1_STR}/auth/signup",
            json=user_data
        )
        
        # Then: The request is rejected
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.json()["detail"]
    
    @it("rejects signup with weak password")
    def test_signup_weak_password(self, client):
        # Given: A user with a weak password
        user_data = {
            "email": "weak@example.com",
            "password": "weakpass",  # Missing uppercase and digit
            "first_name": "Weak",
            "last_name": "Password"
        }
        
        # When: Signup request is made
        response = client.post(
            f"{settings.API_V1_STR}/auth/signup",
            json=user_data
        )
        
        # Then: The request is rejected
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        # Error details in response should mention password requirements
    
    @it("allows login with valid credentials")
    def test_login_success(self, client, test_db):
        # Given: A registered user
        user_data = {
            "email": "login@example.com",
            "password": "Password123",
            "first_name": "Login",
            "last_name": "User"
        }
        user_in = UserCreate(**user_data)
        crud_user.create(db=test_db, obj_in=user_in)
        
        # When: Login request is made
        login_data = {
            "username": user_data["email"],
            "password": user_data["password"]
        }
        response = client.post(f"{settings.API_V1_STR}/auth/login/access-token", data=login_data)
        
        # Then: Login is successful with token
        assert response.status_code == status.HTTP_200_OK
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"
    
    @it("rejects login with invalid credentials")
    def test_login_invalid_credentials(self, client):
        # Given: Invalid login credentials
        login_data = {
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        # When: Login request is made
        response = client.post(f"{settings.API_V1_STR}/auth/login/access-token", data=login_data)
        
        # Then: Login is rejected
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Incorrect email or password" in response.json()["detail"]


@describe("User Endpoints")
class TestUserEndpoints:
    
    @it("allows authenticated user to get their profile")
    def test_read_users_me(self, client, test_db):
        # Given: An authenticated user
        user_data = {
            "email": "me@example.com",
            "password": "Password123",
            "first_name": "Test",
            "last_name": "User"
        }
        user_in = UserCreate(**user_data)
        user = crud_user.create(db=test_db, obj_in=user_in)
        
        # And: The user is logged in
        login_data = {
            "username": user_data["email"],
            "password": user_data["password"]
        }
        tokens = client.post(f"{settings.API_V1_STR}/auth/login/access-token", data=login_data)
        token = tokens.json()["access_token"]
        
        # When: User requests their profile
        response = client.get(
            f"{settings.API_V1_STR}/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Then: User profile is returned
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["email"] == user_data["email"]
        assert response.json()["first_name"] == user_data["first_name"]
        assert response.json()["last_name"] == user_data["last_name"]
        assert "hashed_password" not in response.json()
    
    @it("rejects unauthenticated access to user profile")
    def test_read_users_me_unauthorized(self, client):
        # Given: No authentication
        
        # When: User requests the me endpoint without auth
        response = client.get(f"{settings.API_V1_STR}/users/me")
        
        # Then: Request is rejected
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
