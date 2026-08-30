import os
import sys
import random

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

def generate_mock_students():
    db = SessionLocal()
    
    # Create tables if not exist
    models.Base.metadata.create_all(bind=engine)
    
    first_names = ["John", "Jane", "Alex", "Maria", "Liam", "Emma", "Noah", "Olivia", "William", "Sophia",
                   "James", "Isabella", "Oliver", "Mia", "Benjamin", "Charlotte", "Elijah", "Amelia", "Lucas", "Harper"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    grades = ['Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    
    print("Generating 30 mock students...")
    hashed_pw = get_password_hash("student123")
    
    for _ in range(30):
        first = random.choice(first_names)
        last = random.choice(last_names)
        grade = random.choice(grades)
        username = f"{last.lower()}_{first.lower()}_SY".replace(" ", "")
        
        # Check if username exists
        existing_user = db.query(models.User).filter(models.User.username == username).first()
        if existing_user:
            username = f"{username}{random.randint(1, 999)}"
        
        new_student = models.Student(
            first_name=first,
            last_name=last,
            grade_level=grade,
            school_year="2025-2026",
            section=f"Section {random.choice(['A', 'B', 'C'])}",
            enrollment_status="Enrolled",
            account_username=username,
            initial_password="student123",
            req_birth_cert=1,
            req_form_138=1,
            req_good_moral=1,
            req_pictures=1
        )
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        
        new_user = models.User(
            username=username,
            full_name=f"{first} {last}",
            hashed_password=hashed_pw,
            role="Student",
            student_id=new_student.id,
            is_active=1
        )
        db.add(new_user)
        
        # Add mock tuition
        new_tuition = models.TuitionPayment(
            student_id=new_student.id,
            amount_due=15000.0,
            amount_paid=random.choice([0, 5000.0, 15000.0]),
            term="Annual SY 2025-2026",
            status=random.choice(["Pending", "Paid", "Overdue"])
        )
        db.add(new_tuition)
        
        # Add mock academic records
        for subject in ["Math", "Science", "English"]:
            ar = models.AcademicRecord(
                student_id=new_student.id,
                subject=subject,
                score=random.uniform(75.0, 99.0),
                term="1st Quarter",
                school_year="2025-2026"
            )
            db.add(ar)
            
        db.commit()
    
    print("Mock students and accounts successfully created!")
    db.close()

if __name__ == "__main__":
    generate_mock_students()
