#!/usr/bin/env python3

"""Simple test to debug test issues."""

import sys
sys.path.append('.')

def test_user_crud():
    """Test basic user CRUD operations."""
    from app.crud.crud_user import user
    from app.schemas.user import UserCreate
    from app.db.session import SessionLocal
    
    # Create a test user data
    user_data = {
        "email": "testcrud@example.com",
        "password": "Password123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        # Create user schema
        user_in = UserCreate(**user_data)
        print(f"UserCreate schema created: {user_in}")
        
        # Test the dict method issue
        try:
            user_dict = user_in.dict()
            print(f"user_in.dict() works: {user_dict}")
        except Exception as e:
            print(f"user_in.dict() failed: {e}")
            try:
                user_dict = user_in.model_dump()
                print(f"user_in.model_dump() works: {user_dict}")
            except Exception as e2:
                print(f"user_in.model_dump() also failed: {e2}")
        
        # Test database creation
        db = SessionLocal()
        try:
            db_user = user.create(db=db, obj_in=user_in)
            print(f"User created successfully: {db_user.email}")
            db.commit()
        except Exception as e:
            print(f"Database creation failed: {e}")
            db.rollback()
        finally:
            db.close()
        
    except Exception as e:
        print(f"Schema creation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_user_crud()