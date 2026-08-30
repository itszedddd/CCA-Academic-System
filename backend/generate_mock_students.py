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
    
    first_names = ["Juan", "Jose", "Andres", "Apolinario", "Emilio", "Antonio", "Marcelo", "Gregorio", "Melchora", "Gabriela",
                   "Teresa", "Lapu", "Diego", "Miguel", "Manuel", "Corazon", "Ramon", "Ferdinand", "Graciano", "Carlos"]
    last_names = ["Luna", "Rizal", "Bonifacio", "Mabini", "Aguinaldo", "del Pilar", "Lopez Jaena", "Aquino", "Silang", "Magbanua",
                  "Lapu", "Malvar", "Quezon", "Magsaysay", "Marcos", "Garcia", "Roxas", "Macapagal", "Osmena", "Dela Cruz"]
    grade_sections = [
        ('Kinder', 'Kindness'),
        ('Grade 1', 'Love'),
        ('Grade 2', 'Joyful'),
        ('Grade 3', 'Faith'),
        ('Grade 4', 'Grace'),
        ('Grade 5', 'Loyalty'),
        ('Grade 6', 'Obedience'),
        ('Grade 7', 'Meekness'),
        ('Grade 8', 'Courage'),
        ('Grade 9', 'Benevolence'),
        ('Grade 10', 'Perseverance')
    ]
    
    print("Clearing existing mock students...")
    db.query(models.User).filter(models.User.role == "Student").delete()
    db.query(models.Student).delete()
    db.commit()

    print(f"Generating 30 mock students per section ({len(grade_sections) * 30} total)...")
    hashed_pw = get_password_hash("password123")
    
    for grade, section in grade_sections:
        for _ in range(30):
            first = random.choice(first_names)
            last = random.choice(last_names)
            username = f"{last.lower()}_{first.lower()}_2026".replace(" ", "")
            
            # Check if username exists
            existing_user = db.query(models.User).filter(models.User.username == username).first()
            if existing_user:
                username = f"{username}{random.randint(1, 9999)}"
            
            new_student = models.Student(
                first_name=first,
                last_name=last,
                grade_level=grade,
                school_year="2025-2026",
                section=section,
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
