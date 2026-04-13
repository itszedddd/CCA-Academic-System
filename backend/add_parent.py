import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import engine, SessionLocal
from app.models import User, Student
from app.auth import get_password_hash

db = SessionLocal()
existing = db.query(User).filter(User.username == "parent").first()
if not existing:
    parent_user = User(
        username="parent",
        hashed_password=get_password_hash("parent123"),
        role="Parent",
        is_active=1,
        student_id=1 # Parent of Juan Dela Cruz
    )
    db.add(parent_user)
    db.commit()
    print("Parent mock account created. Username: parent, Password: parent123")
else:
    print("Parent account already exists.")
db.close()
