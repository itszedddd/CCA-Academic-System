import os
import sys
import random
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), "app"))
from .database import SessionLocal
from . import models
from .school_config import SUBJECTS, SECTIONS

def run_seed():
    db = SessionLocal()
    print("Starting data seed...")

    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Laura", "Mike", "Nina", "Oscar", "Paula", "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander", "Yara", "Zack", "Aaron", "Bella"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]

    terms = ["SY 2026-2027", "SY 2025-2026"]
    
    # We want a mix of passing, failing, and overdue students
    
    for i in range(30):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        grade_level = random.choice(list(SECTIONS.keys()))
        section = SECTIONS[grade_level]["name"]
        
        # Determine student archetype
        # 10% High Risk Dropout (Poor grades + High Absence)
        # 20% High Risk Financial (Overdue payments)
        # 70% Normal
        archetype = random.random()
        
        student = models.Student(
            first_name=fname,
            last_name=lname,
            grade_level=grade_level,
            school_year="2026-2027",
            section=section.split(" - ")[1] if " - " in section else section,
            contact_email=f"{fname.lower()}.{lname.lower()}@example.com",
            enrollment_status="Enrolled",
            membership_type="Regular",
            gender=random.choice(["Male", "Female"]),
            date_of_birth="2010-01-01",
            address="123 Dummy St",
            parent_name=f"Mr/Ms {lname}",
            contact_number="09123456789",
            account_username=f"{fname.lower()}{random.randint(100,999)}",
            initial_password="password123"
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        # Tuition Payment
        tuition_status = "Overdue" if archetype > 0.7 and archetype <= 0.9 else ("Paid" if archetype > 0.9 else "Pending")
        base_tuition = 35000.0
        amount_paid = 0.0 if tuition_status != "Paid" else base_tuition
        
        payment = models.TuitionPayment(
            student_id=student.id,
            tuition_fee=base_tuition,
            amount_due=base_tuition,
            amount_paid=amount_paid,
            term="SY 2026-2027",
            status=tuition_status,
            risk_score=0.9 if tuition_status == "Overdue" else 0.1
        )
        db.add(payment)
        
        # Academic Records
        subjects = SUBJECTS.get(grade_level, ["English", "Math", "Science"])
        for subject in subjects:
            for term in ["Term 1", "Term 2", "Term 3"]:
                # If high risk dropout, give failing grades
                if archetype <= 0.1:
                    score = random.randint(60, 72)
                else:
                    score = random.randint(75, 98)
                    
                record = models.AcademicRecord(
                    student_id=student.id,
                    subject=subject,
                    term=term,
                    score=score
                )
                db.add(record)
        
        # Attendance (give some absences)
        total_days = 20
        absences = random.randint(5, 10) if archetype <= 0.1 else random.randint(0, 2)
        
        for d in range(total_days):
            date_str = (datetime.now() - timedelta(days=d)).strftime("%Y-%m-%d")
            status = "Absent" if d < absences else "Present"
            att = models.Attendance(
                student_id=student.id,
                date=date_str,
                status=status
            )
            db.add(att)

    db.commit()
    print("Seed completed. Inserted 30 students with analytics data.")
    db.close()

if __name__ == "__main__":
    run_seed()
