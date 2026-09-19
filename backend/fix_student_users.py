import sys
import os
from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal
from app.models import Student, User
from app.auth import get_password_hash

def fix_students():
    db = SessionLocal()
    students = db.query(Student).all()
    
    default_password = get_password_hash("password123")
    added_users = 0
    
    for student in students:
        # Generate a username if none exists
        username = student.account_username
        if not username:
            if student.first_name:
                username = student.first_name.lower().replace(" ", "")
            else:
                username = f"student_{student.id}"
            student.account_username = username
        
        # Check if user exists for this student
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(
                username=username,
                full_name=f"{student.first_name} {student.last_name}",
                hashed_password=default_password,
                role="Student",
                is_active=1,
                student_id=student.id
            )
            db.add(user)
            added_users += 1
        else:
            # Update password just in case
            user.hashed_password = default_password
    
    db.commit()
    print(f"Updated {len(students)} students and added {added_users} student users with 'password123'.")
    db.close()

if __name__ == "__main__":
    fix_students()
