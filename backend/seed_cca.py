import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, Student, User, AcademicRecord, Attendance, TuitionPayment, PaymentRecord, EnrollmentForm
from app.auth import get_password_hash
from app.ai_engine import predict_tuition_default

# Must match the URL in database.py
SQLALCHEMY_DATABASE_URL = "sqlite:///./cca.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        from app.school_config import SECTIONS

        # --- Create Base Users ---
        base_users = [
            User(username="superadmin", full_name="System Superadmin", hashed_password=get_password_hash("superadmin123"), role="Superadmin", is_active=1),
            User(username="principal", full_name="Elias Principal", hashed_password=get_password_hash("principal123"), role="Principal", is_active=1),
            User(username="cashier", full_name="Jane Cashier", hashed_password=get_password_hash("cashier123"), role="Cashier", is_active=1),
            User(username="registrar", full_name="Bob Registrar", hashed_password=get_password_hash("registrar123"), role="Registrar", is_active=1),
            User(username="admission", full_name="Alice Admission", hashed_password=get_password_hash("admission123"), role="Admission", is_active=1)
        ]
        db.add_all(base_users)
        db.commit()

        import random
        random.seed(42)

        # --- Create Teachers for all sections ---
        teachers = []
        for grade, info in SECTIONS.items():
            section = info['name']
            t_user = User(
                username=f"teacher_{grade.lower().replace(' ', '')}",
                full_name=f"Teacher {section}",
                hashed_password=get_password_hash("teacher123"),
                role="Teacher",
                section=section,
                is_active=1
            )
            teachers.append(t_user)
        teachers.append(
            User(
                username="teacher",
                full_name="Teacher Meekness",
                hashed_password=get_password_hash("teacher123"),
                role="Teacher",
                section="Meekness",
                is_active=1
            )
        )
        db.add_all(teachers)
        db.commit()

        # --- Create Students for all sections ---
        first_names = [
            "John", "Mary", "Michael", "Sarah", "James", "Jessica", "David", "Emily", "Daniel", "Emma",
            "Joseph", "Olivia", "Matthew", "Sophia", "Christopher", "Isabella", "Andrew", "Mia", "Joshua", "Ava",
            "Nathan", "Lily", "Ryan", "Chloe", "William", "Zoe", "Ethan", "Grace", "Alexander", "Hannah",
            "Gabriel", "Aria", "Christian", "Ella", "Anthony", "Victoria", "Tyler", "Madison", "Dylan", "Scarlett",
            "Samuel", "Layla", "Brandon", "Riley", "Benjamin", "Penelope", "Zachary", "Lillian", "Logan", "Aurora",
            "Justin", "Natalie", "Jose", "Brooklyn", "Kevin", "Leah", "Elijah", "Savannah", "Austin", "Audrey",
            "Luke", "Claire", "Evan", "Skylar", "Thomas", "Lucy", "Aaron", "Paisley", "Jackson", "Everly",
            "Jack", "Anna", "Hunter", "Caroline", "Cameron", "Nova", "Connor", "Genesis", "Isaac", "Emilia",
            "Jason", "Kennedy", "Julian", "Samantha", "Gavin", "Maya", "Charles", "Willow", "Isaiah", "Kinsley",
            "Adam", "Naomi", "Jeremiah", "Aaliyah", "Ian", "Elena", "Wyatt", "Sarah", "Jonathan", "Ariana",
            "Leo", "Allison", "Mateo", "Gabriella", "Lincoln", "Alice", "Sebastian", "Madelyn", "Levi", "Cora"
        ]
        
        last_names = [
            "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
            "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
            "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
            "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
            "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins",
            "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey",
            "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez",
            "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross",
            "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington",
            "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes"
        ]
        
        all_students = []
        for grade, info in SECTIONS.items():
            section = info['name']
            # Create 10-15 students per section
            num_students = random.randint(10, 15)
            for i in range(num_students):
                fn = random.choice(first_names)
                ln = random.choice(last_names)
                has_all_docs = random.random() > 0.2
                s = Student(
                    first_name=f"{fn} {i+1}", last_name=f"{ln} {grade.split()[-1]}", 
                    grade_level=grade, section=section,
                    contact_email=f"parent_{fn.lower()}{i}@cca.edu.ph", profile_image=None, 
                    enrollment_status="Enrolled" if has_all_docs else "Hold: Incomplete Req",
                    school_year="2026-2027",
                    req_birth_cert=1 if has_all_docs else random.choice([0, 1]),
                    req_form_138=1 if has_all_docs else random.choice([0, 1]),
                    req_good_moral=1 if has_all_docs else random.choice([0, 1]),
                    req_pictures=1 if has_all_docs else random.choice([0, 1]),
                    account_username=f"{fn.lower()}{i}_{ln.lower()}{grade.split()[-1]}",
                    initial_password="cca2026",
                    membership_type=random.choice(["CBC Member", "Non-Member"])
                )
                all_students.append(s)
        
        db.add_all(all_students)
        db.commit()

        # --- Create Users for all mock students ---
        student_users = []
        for s in all_students:
            user = User(
                username=s.account_username,
                hashed_password=get_password_hash(s.initial_password),
                role="Student",
                is_active=1,
                student_id=s.id
            )
            student_users.append(user)
        db.add_all(student_users)
        db.commit()

        # Save first student reference for academic records
        humility_students = [s for s in all_students if s.section == "Meekness"]
        other_students = [s for s in all_students if s.section != "Meekness"]
        from app.school_config import SUBJECTS
        
        import random
        from datetime import date, timedelta
        random.seed(42)
        records = []
        for s in humility_students + other_students:
            subjects = SUBJECTS.get(s.grade_level, [])
            for subj in subjects:
                for term in ["Term 1", "Term 2", "Term 3"]:
                    # Create a failing trend for Science and Math randomly
                    score_base = random.randint(76, 95)
                    if subj in ["Mathematics", "Science"] and s.first_name in ["Juan", "Maria"]:
                        score_base = max(65, 80 - (int(term[-1]) * 5)) # Dropping scores
                    records.append(AcademicRecord(student_id=s.id, subject=subj, score=round(score_base, 1), term=term))
        db.add_all(records)

        # --- Mock Attendance ---
        attendances = []
        base_date = date.today() - timedelta(days=10)
        attendance_statuses = ["Present", "Present", "Present", "Excused", "Absent"]
        for s in humility_students + other_students:
            for i in range(10):
                attendances.append(Attendance(
                    student_id=s.id,
                    date=(base_date + timedelta(days=i)).strftime('%Y-%m-%d'),
                    status=random.choice(attendance_statuses),
                    remarks="Mock seed data" if random.random() > 0.8 else None
                ))
        db.add_all(attendances)

        # --- Tuition Payments ---
        payments = []
        statuses = ["Paid", "Pending", "Overdue"]
        for idx, s in enumerate(humility_students + other_students):
            status = statuses[idx % 3]
            amount_due = 35000.00
            amount_paid = 35000.00 if status == "Paid" else round(random.uniform(0, 20000), 2)
            if status == "Pending" and amount_paid == 0: amount_paid = 10000.00
            tp = TuitionPayment(
                student_id=s.id,
                amount_due=amount_due,
                amount_paid=amount_paid,
                term="Term 1",
                status=status,
                risk_score=0.0 # Placeholder
            )
            payments.append(tp)
            
        # Compute ML Risk 
        for p in payments:
            risk_data = predict_tuition_default([p.amount_due], [p.amount_paid], [p.status])
            p.risk_score = risk_data["risk_score"]
            
        db.add_all(payments)
        db.flush() # flush to get IDs for TuitionPayment
        
        payment_records = []
        for p in payments:
            if p.amount_paid > 0:
                # Add 1 or 2 historical records
                import datetime
                pr1 = PaymentRecord(
                    tuition_id=p.id,
                    amount=p.amount_paid * 0.5,
                    or_number=f"OR-{p.id}-A",
                    date_recorded="2025-08-15"
                )
                pr2 = PaymentRecord(
                    tuition_id=p.id,
                    amount=p.amount_paid * 0.5,
                    or_number=f"OR-{p.id}-B",
                    date_recorded="2025-10-15"
                )
                payment_records.extend([pr1, pr2])
        
        db.add_all(payment_records)
        db.commit()

        # --- Mock Enrollment Form ---
        mock_form = EnrollmentForm(
            student_id=None,
            form_type="Pre-Registration Application",
            file_path="/uploads/mock_form.jpg",
            status="Needs Review"
        )

        # Additional mock forms linked to students
        mock_form2 = EnrollmentForm(
            student_id=humility_students[0].id,  # Juan Dela Cruz
            form_type="Pre-Registration Application",
            file_path="/uploads/mock_form_juan.jpg",
            status="Needs Review"
        )

        mock_form3 = EnrollmentForm(
            student_id=humility_students[1].id,  # Maria Clara
            form_type="Birth Certificate (PSA)",
            file_path="/uploads/mock_bc_maria.jpg",
            status="Needs Review"
        )

        mock_form4 = EnrollmentForm(
            student_id=humility_students[2].id,  # Emilio Aguinaldo
            form_type="Pre-Registration Application",
            file_path="/uploads/mock_form_emilio.jpg",
            status="Needs Review"
        )

        mock_form5 = EnrollmentForm(
            student_id=other_students[0].id,  # Andres Bonifacio
            form_type="Form 138 (Report Card)",
            file_path="/uploads/mock_f138_andres.jpg",
            status="Needs Review"
        )

        mock_form6 = EnrollmentForm(
            student_id=humility_students[3].id,  # Apolinario Mabini
            form_type="Good Moral Certificate",
            file_path="/uploads/mock_gm_apolinario.jpg",
            status="Needs Review"
        )

        db.add_all([mock_form, mock_form2, mock_form3, mock_form4, mock_form5, mock_form6])
        db.commit()

        print("Database seeded completely with 22+ Humility section students and Philippine Peso tuition records.")

    except Exception as e:
        print("An error occurred:", e)
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
