import sys
import os
from sqlalchemy.orm import Session

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from app.auth import verify_password, get_password_hash

def check():
    db = SessionLocal()
    try:
        print("Checking users in database...")
        users = db.query(models.User).all()
        if not users:
            print("No users found in database!")
            return
            
        for u in users:
            print(f"User: {u.username}, Role: {u.role}")
            print(f"  Hashed PW: {u.hashed_password}")
            
            # Test a manual hash
            res = verify_password("password123", u.hashed_password)
            print(f"  Verify 'password123': {res}")
            
            # Generate a new hash to see why it might fail
            new_hash = get_password_hash("password123")
            print(f"  Sample New Hash: {new_hash}")
            print(f"  Verify Sample: {verify_password('password123', new_hash)}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check()
