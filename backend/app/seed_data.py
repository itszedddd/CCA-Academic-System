import os
import sys
import random
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), "app"))
from .database import SessionLocal
from . import models
from .school_config import SUBJECTS, SECTIONS
from .fee_structure import get_tuition_yearly, get_energy_fee, BOOKS_PRICES

def run_seed():
    db = SessionLocal()
    print("Starting data seed...")

    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Laura", "Mike", "Nina", "Oscar", "Paula", "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander", "Yara", "Zack", "Aaron", "Bella"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]

    terms = ["SY 2026-2027", "SY 2025-2026"]
    
    # We want a mix of passing, failing, and overdue students
    for i in range(30):
        archetype = random.random()
        grade_level = random.choice(list(SECTIONS.keys()))
        
        student = models.Student(
            first_name=random.choice(first_names),
            last_name=random.choice(last_names),
            grade_level=grade_level,
            school_year="SY 2026-2027",
            section=SECTIONS[grade_level]["name"],
            enrollment_status="Enrolled",
            membership_type="Regular",
            enrollment_type="Old Student",
            is_archived=0,
            gender=random.choice(["Male", "Female"]),
            date_of_birth="2010-01-01",
            address="123 Example St",
            parent_name="Parent Name",
            contact_number="09123456789",
            contact_email=f"parent{i}@example.com"
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        # Tuition Payment
        tuition_status = "Overdue" if archetype > 0.7 and archetype <= 0.9 else ("Paid" if archetype > 0.9 else "Pending")
        
        reg_fee = 5700.0
        tuition_fee = float(get_tuition_yearly(grade_level, "Regular"))
        energy_fee = float(get_energy_fee(grade_level))
        books_fee = float(BOOKS_PRICES.get(grade_level, 8500.0))
        
        total_due = reg_fee + tuition_fee + energy_fee + books_fee
        
        # If Paid, amount_paid is total. If Pending/Overdue, they might have paid a portion (like Reg + Books).
        if tuition_status == "Paid":
            amount_paid = total_due
        elif tuition_status == "Pending":
            amount_paid = reg_fee + books_fee # Just paid registration and books
        else:
            amount_paid = reg_fee # Only paid registration
        
        payment = models.TuitionPayment(
            student_id=student.id,
            reg_fee=reg_fee,
            tuition_fee=tuition_fee,
            energy_fee=energy_fee,
            books_fee=books_fee,
            esc_subsidy=0.0,
            discount=0.0,
            amount_due=total_due,
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
