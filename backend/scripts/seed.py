import sys
import os

# Ensure app can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app import models

# Recreate the DB for seeding
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(models.Student).first():
        print("Database already seeded")
        return

    # Create dummy students
    students = [
        models.Student(first_name="Alice", last_name="Smith", grade_level="Grade 10", enrollment_status="Enrolled"),
        models.Student(first_name="Bob", last_name="Jones", grade_level="Grade 10", enrollment_status="Enrolled"),
        models.Student(first_name="Charlie", last_name="Brown", grade_level="Grade 8", enrollment_status="Enrolled")
    ]
    db.add_all(students)
    db.commit()
    
    # Refresh to get IDs
    for s in students:
        db.refresh(s)
        
    # Alice is doing well
    alice_records = [
        models.AcademicRecord(student_id=students[0].id, subject="Math", score=85.0, term="Term 1"),
        models.AcademicRecord(student_id=students[0].id, subject="Math", score=88.0, term="Term 2"),
        models.AcademicRecord(student_id=students[0].id, subject="Math", score=90.0, term="Term 3"),
        models.AcademicRecord(student_id=students[0].id, subject="Math", score=92.0, term="Term 4")
    ]
    
    # Bob is declining heavily (Will trigger the AI Warning)
    bob_records = [
        models.AcademicRecord(student_id=students[1].id, subject="Math", score=95.0, term="Term 1"),
        models.AcademicRecord(student_id=students[1].id, subject="Math", score=89.0, term="Term 2"),
        models.AcademicRecord(student_id=students[1].id, subject="Math", score=78.0, term="Term 3"),
        models.AcademicRecord(student_id=students[1].id, subject="Math", score=70.0, term="Term 4")
    ]
    
    # Charlie is stable
    charlie_records = [
        models.AcademicRecord(student_id=students[2].id, subject="Science", score=80.0, term="Term 1"),
        models.AcademicRecord(student_id=students[2].id, subject="Science", score=81.0, term="Term 2"),
        models.AcademicRecord(student_id=students[2].id, subject="Science", score=79.0, term="Term 3"),
        models.AcademicRecord(student_id=students[2].id, subject="Science", score=82.0, term="Term 4")
    ]
    
    db.add_all(alice_records + bob_records + charlie_records)
    db.commit()
    db.close()
    
    print("Database successfully seeded with academic records!")

if __name__ == "__main__":
    seed_data()
