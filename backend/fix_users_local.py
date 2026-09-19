import sys
import os
from dotenv import load_dotenv

# Load env variables so we connect to the right local SQLite DB
load_dotenv()

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def seed_users():
    db = SessionLocal()
    
    # Check if users exist in the actual DB
    if db.query(User).count() > 0:
        # Update existing passwords just in case
        print("Users exist, updating passwords...")
        default_password = get_password_hash("password123")
        users = db.query(User).all()
        for u in users:
            u.hashed_password = default_password
        db.commit()
        db.close()
        return

    default_password = get_password_hash("password123")
    
    users_data = [
        # System Roles
        User(username="admin", full_name="System Admin", hashed_password=default_password, role="Superadmin"),
        User(username="principal", full_name="School Principal", hashed_password=default_password, role="Principal"),
        User(username="cashier", full_name="Main Cashier", hashed_password=default_password, role="Cashier"),
        User(username="registrar", full_name="Head Registrar", hashed_password=default_password, role="Registrar"),
        User(username="admission", full_name="Admission Officer", hashed_password=default_password, role="Admission"),
        User(username="guidance", full_name="Guidance Counselor", hashed_password=default_password, role="Guidance"),
        
        # Teacher Roles
        User(username="teacher_kindness", full_name="Kindergarten Teacher (Kindness)", hashed_password=default_password, role="Teacher", section="Kindness"),
        User(username="teacher_patience", full_name="Grade 1 Teacher (Patience)", hashed_password=default_password, role="Teacher", section="Patience"),
        User(username="teacher_peace", full_name="Grade 2 Teacher (Peace)", hashed_password=default_password, role="Teacher", section="Peace"),
        User(username="teacher_joy", full_name="Grade 3 Teacher (Joy)", hashed_password=default_password, role="Teacher", section="Joy"),
        User(username="teacher_love", full_name="Grade 4 Teacher (Love)", hashed_password=default_password, role="Teacher", section="Love"),
        User(username="teacher_faith", full_name="Grade 5 Teacher (Faith)", hashed_password=default_password, role="Teacher", section="Faith"),
        User(username="teacher_hope", full_name="Grade 6 Teacher (Hope)", hashed_password=default_password, role="Teacher", section="Hope"),
        User(username="teacher_humility", full_name="Grade 7 Teacher (Humility)", hashed_password=default_password, role="Teacher", section="Humility"),
        User(username="teacher_gentleness", full_name="Grade 8 Teacher (Gentleness)", hashed_password=default_password, role="Teacher", section="Gentleness"),
        User(username="teacher_wisdom", full_name="Grade 9 Teacher (Wisdom)", hashed_password=default_password, role="Teacher", section="Wisdom"),
        User(username="teacher_courage", full_name="Grade 10 Teacher (Courage)", hashed_password=default_password, role="Teacher", section="Courage"),
    ]
    
    db.add_all(users_data)
    db.commit()
    print(f"Added {len(users_data)} users into local cca.db with password 'password123'.")
    db.close()

if __name__ == "__main__":
    seed_users()
