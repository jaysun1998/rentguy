#!/usr/bin/env python3

"""Debug script to test authentication endpoints directly."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test signup
print("Testing signup endpoint...")
user_data = {
    "email": "test@example.com",
    "password": "Password123",
    "first_name": "Test",
    "last_name": "User"
}

try:
    response = client.post("/api/v1/auth/signup", json=user_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code != 201:
        print("ERROR: Signup failed")
    else:
        print("SUCCESS: Signup worked")
        
    # Test login
    print("\nTesting login endpoint...")
    login_data = {
        "username": user_data["email"],
        "password": user_data["password"]
    }
    response = client.post("/api/v1/auth/login/access-token", data=login_data)
    print(f"Login Status Code: {response.status_code}")
    print(f"Login Response: {response.text}")
    
except Exception as e:
    print(f"Exception occurred: {e}")
    import traceback
    traceback.print_exc()