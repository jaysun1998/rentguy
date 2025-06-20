import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import get_db
from app.db.base_class import Base
from app.core.config import settings

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import all models to ensure they're registered with the Base metadata
from app.models import *  # This imports all models

# Override the get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def test_db():
    # Set up the database for each test
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up after each test - drop and recreate tables
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="function")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function")
def auth_client(client, test_db):
    from app.crud.crud_user import user
    from app.schemas.user import UserCreate
    
    # Create a test user
    user_data = {
        "email": "test@example.com",
        "password": "Password123",  # Meets validation requirements
        "first_name": "Test",
        "last_name": "User"
    }
    
    # Create user in database
    user_in = UserCreate(**user_data)
    user_obj = user.create(db=test_db, obj_in=user_in)
    test_db.commit()
    
    # Get access token
    login_data = {
        "username": user_data["email"],
        "password": user_data["password"]
    }
    response = client.post("/api/v1/auth/login/access-token", data=login_data)
    assert response.status_code == 200, f"Login failed: {response.json()}"
    token = response.json()["access_token"]
    
    # Set auth header for subsequent requests
    headers = {"Authorization": f"Bearer {token}"}
    client.headers.update(headers)
    
    yield client