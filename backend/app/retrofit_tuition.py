import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "app"))
from .database import SessionLocal
from . import models
from datetime import datetime, timedelta

def run_retrofit():
    db = SessionLocal()
    print("Starting tuition retrofit...")

    students = db.query(models.Student).all()
    student_count = 0

    for student in students:
        payment = db.query(models.TuitionPayment).filter(models.TuitionPayment.student_id == student.id).first()
        if not payment:
            # Generate one
            try:
                from .fee_structure import compute_total_fees
                fees = compute_total_fees(student.grade_level, student.membership_type, False, False)
                base_tuition = sum(f["amount"] for f in fees) if fees else 35000.0
            except Exception:
                base_tuition = 35000.0

            new_tuition = models.TuitionPayment(
                student_id=student.id,
                tuition_fee=base_tuition,
                amount_due=base_tuition,
                amount_paid=0.0,
                term="SY 2026-2027",
                status="Pending",
                risk_score=0.1
            )
            db.add(new_tuition)
            student_count += 1
            
    db.commit()
    print(f"Retrofitted {student_count} students with new tuition records.")
    db.close()
    print("Retrofit completed.")

if __name__ == "__main__":
    run_retrofit()
