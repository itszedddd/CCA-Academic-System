import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, Student, User, AcademicRecord, Attendance, TuitionPayment, EnrollmentForm
from app.auth import get_password_hash

# Must match the URL in database.py
SQLALCHEMY_DATABASE_URL = "sqlite:///./cca.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_data():
    # Remove old database if exists
    if os.path.exists("cca.db"):
        os.remove("cca.db")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Create Users
        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role="Administrator",
            is_active=1
        )
        teacher_user = User(
            username="teacher",
            hashed_password=get_password_hash("teacher123"),
            role="Teacher",
            is_active=1
        )
        cashier_user = User(
            username="cashier",
            hashed_password=get_password_hash("cashier123"),
            role="Cashier",
            is_active=1
        )
        registrar_user = User(
            username="registrar",
            hashed_password=get_password_hash("registrar123"),
            role="Registrar",
            is_active=1
        )
        student_user = User(
            username="student",
            hashed_password=get_password_hash("student123"),
            role="Student",
            is_active=1,
            student_id=1 # Pointing to Juan Dela Cruz
        )

        db.add_all([admin_user, teacher_user, cashier_user, registrar_user, student_user])
        db.commit()

        # Create Students
        student1 = Student(
            first_name="Juan",
            last_name="Dela Cruz",
            grade_level="Grade 10",
            section="Rizal",
            contact_email="parent_juan@example.com",
            profile_image="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Jose_Rizal_full.jpg/220px-Jose_Rizal_full.jpg",
            enrollment_status="Enrolled"
        )
        student2 = Student(
            first_name="Maria",
            last_name="Clara",
            grade_level="Grade 10",
            section="Rizal",
            contact_email="parent_maria@example.com",
            profile_image="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/La_Bulaquena_by_Juan_Luna.jpg/220px-La_Bulaquena_by_Juan_Luna.jpg",
            enrollment_status="Enrolled"
        )
        student3 = Student(
            first_name="Andres",
            last_name="Bonifacio",
            grade_level="Grade 9",
            section="Jacinto",
            contact_email="parent_andres@example.com",
            profile_image="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Andr%C3%A9s_Bonifacio.jpg/220px-Andr%C3%A9s_Bonifacio.jpg",
            enrollment_status="Pending"
        )

        db.add_all([student1, student2, student3])
        db.commit()

        # Create Mock Academic Records
        records = [
            AcademicRecord(student_id=student1.id, subject="Math", score=88.5, term="Term 1"),
            AcademicRecord(student_id=student1.id, subject="Science", score=85.0, term="Term 1"),
            AcademicRecord(student_id=student2.id, subject="Math", score=95.0, term="Term 1"),
            AcademicRecord(student_id=student2.id, subject="Science", score=92.5, term="Term 1"),
            AcademicRecord(student_id=student3.id, subject="Math", score=78.0, term="Term 1"),
        ]
        db.add_all(records)
        
        # Create Mock Tuition Payments (in Philippine Peso)
        payments = [
            TuitionPayment(
                student_id=student1.id,
                amount_due=35000.00,
                amount_paid=35000.00,
                term="Term 1",
                status="Paid",
                risk_score=0.1
            ),
            TuitionPayment(
                student_id=student2.id,
                amount_due=35000.00,
                amount_paid=15000.00,
                term="Term 1",
                status="Pending",
                risk_score=0.5
            ),
            TuitionPayment(
                student_id=student3.id,
                amount_due=35000.00,
                amount_paid=0.00,
                term="Term 1",
                status="Overdue",
                risk_score=0.9
            )
        ]
        db.add_all(payments)
        db.commit()

        print("Database seeded completely with mock students and Philippine Peso tuition records.")

    except Exception as e:
        print("An error occurred:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
