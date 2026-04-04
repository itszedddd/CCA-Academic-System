import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

# Add parent dir to path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

def seed():
    # Drop and recreate for clean demo
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        members = [
            ("Sarah Jane", "Almaras"),
            ("John Luiz", "Bangsoy"),
            ("Rhea Mae", "Batayo"),
            ("Jericho", "Dahil-Dahil"),
            ("Farisha Mae", "Magsayo"),
            ("Mark Lester", "Maribbay"),
            ("Adrian", "Mendez"),
            ("Cedrick Jay", "Tobias"),
            ("John Loyd", "Tumalom"),
            ("Emerex Feguro", "Mogado")
        ]

        subjects = ["Mathematics", "Science", "English", "History", "ICT", "PE"]
        terms = ["1st Grading", "2nd Grading", "3rd Grading"]

        students = []
        for first, last in members:
            student = models.Student(
                first_name=first,
                last_name=last,
                grade_level="Grade 12",
                section="St. Joseph",
                contact_email=f"{first.lower().replace(' ', '')}@example.com",
                enrollment_status="Enrolled"
            )
            db.add(student)
            students.append(student)
        
        db.commit()

        # Add Academic Records
        for s in students:
            # Explicitly set trends based on user request
            full_name = f"{s.first_name} {s.last_name}"
            if full_name in ["John Loyd Tumalom", "John Luiz Bangsoy"]:
                trend = "declining"
            elif full_name == "Rhea Mae Batayo":
                trend = "improving"
            else:
                trend = random.choice(["improving", "stable"])
            
            base_score = random.randint(80, 92) if trend != "declining" else random.randint(85, 95)
            
            for subject in subjects:
                for i, term in enumerate(terms):
                    if trend == "declining":
                        # Steep decline for clear AI warning
                        score = base_score - (i * random.randint(8, 12))
                    elif trend == "improving":
                        score = (base_score - 10) + (i * random.randint(4, 6))
                    else:
                        score = base_score + random.randint(-2, 2)
                    
                    score = max(60, min(100, score)) # Keep in 60-100 range
                    
                    record = models.AcademicRecord(
                        student_id=s.id,
                        subject=subject,
                        score=score,
                        term=term
                    )
                    db.add(record)

        # Add Attendance
        today = datetime.now()
        for s in students:
            for i in range(10):
                date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
                status = "Present"
                if random.random() < 0.1: status = "Absent"
                if random.random() < 0.05: status = "Late"
                
                attendance = models.Attendance(
                    student_id=s.id,
                    date=date_str,
                    status=status,
                    recorded_by=1 # Mocked admin
                )
                db.add(attendance)

        # Add Initial Users with hashed passwords
        common_password = get_password_hash("password123")
        
        users = [
            models.User(username="admin@icc.edu.ph", role="Administrator", hashed_password=common_password),
            models.User(username="teacher@icc.edu.ph", role="Teacher", hashed_password=common_password),
            models.User(username="student@icc.edu.ph", role="Student", hashed_password=common_password, student_id=students[6].id),
        ]
        db.add_all(users)

        db.commit()
        print(f"Successfully seeded {len(members)} members and their records with JWT auth support.")

    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
