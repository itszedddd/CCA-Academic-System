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
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Create Users
        superadmin_user = User(
            username="superadmin",
            full_name="System Superadmin",
            hashed_password=get_password_hash("superadmin123"),
            role="Superadmin",
            is_active=1
        )
        admin_user = User(
            username="principal",
            full_name="Elias Principal",
            hashed_password=get_password_hash("principal123"),
            role="Principal",
            is_active=1
        )
        teacher_user = User(
            username="teacher",
            full_name="Clara Teacher",
            hashed_password=get_password_hash("teacher123"),
            role="Teacher",
            is_active=1
        )
        cashier_user = User(
            username="cashier",
            full_name="Jane Cashier",
            hashed_password=get_password_hash("cashier123"),
            role="Cashier",
            is_active=1
        )
        registrar_user = User(
            username="registrar",
            full_name="Bob Registrar",
            hashed_password=get_password_hash("registrar123"),
            role="Registrar",
            is_active=1
        )
        admission_registrar_user = User(
            username="admission",
            full_name="Alice Admission",
            hashed_password=get_password_hash("admission123"),
            role="Admission",
            is_active=1
        )
        student_user = User(
            username="student",
            full_name="Juan Dela Cruz",
            hashed_password=get_password_hash("student123"),
            role="Student",
            is_active=1,
            student_id=1 # Pointing to Juan Dela Cruz
        )

        db.add_all([superadmin_user, admin_user, teacher_user, cashier_user, registrar_user, admission_registrar_user, student_user])
        db.commit()

        # --- Create Staff Users ---
        teacher_user.section = "Humility"  # Assign teacher to Grade 7 - Humility

        # --- Create Students: 22 in Grade 7 - Humility (for load testing) ---
        humility_students_data = [
            ("Juan",        "Dela Cruz",     "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Jose_Rizal_full.jpg/220px-Jose_Rizal_full.jpg"),
            ("Maria",       "Clara",         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/La_Bulaquena_by_Juan_Luna.jpg/220px-La_Bulaquena_by_Juan_Luna.jpg"),
            ("Emilio",      "Aguinaldo",     "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Emilio_Aguinaldo_1919.jpg/220px-Emilio_Aguinaldo_1919.jpg"),
            ("Apolinario",  "Mabini",        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Apolinario_Mabini.jpg/220px-Apolinario_Mabini.jpg"),
            ("Antonio",     "Luna",          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Gen._Antonio_Luna.jpg/220px-Gen._Antonio_Luna.jpg"),
            ("Melchora",    "Aquino",        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Melchora_Aquino.jpg/220px-Melchora_Aquino.jpg"),
            ("Gabriela",    "Silang",        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Gabriela_Silang.jpg/220px-Gabriela_Silang.jpg"),
            ("Marcelo",     "Del Pilar",     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Graciano_Lopez_Jaena.jpg/220px-Graciano_Lopez_Jaena.jpg"),
            ("Graciano",    "Lopez Jaena",   "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Graciano_Lopez-Jaena.jpg/220px-Graciano_Lopez-Jaena.jpg"),
            ("Diego",       "Silang",        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Diego_Silang.jpg/220px-Diego_Silang.jpg"),
            ("Lapu-Lapu",   "Mactan",        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Lapu-Lapu_Cebu_City.jpg/220px-Lapu-Lapu_Cebu_City.jpg"),
            ("Rajah",       "Soliman",       "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Rajah_Sulayman_Monument.jpg/220px-Rajah_Sulayman_Monument.jpg"),
            ("Francisco",   "Balagtas",      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/BalagtasPortrait.jpg/220px-BalagtasPortrait.jpg"),
            ("Leona",       "Florentino",    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Leona_Florentino.jpg/220px-Leona_Florentino.jpg"),
            ("Trinidad",    "Tecson",        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Trinidad_Tecson.jpg/220px-Trinidad_Tecson.jpg"),
            ("Gregoria",    "De Jesus",      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Gregoria_De_Jesus_01.jpg/220px-Gregoria_De_Jesus_01.jpg"),
            ("Servillano",  "Aquino",        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Benigno_Aquino_Jr.jpg/220px-Benigno_Aquino_Jr.jpg"),
            ("Teodora",     "Alonso",        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Teodora_Alonso.jpg/220px-Teodora_Alonso.jpg"),
            ("Miguel",      "Malvar",        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Miguel_Malvar.jpg/220px-Miguel_Malvar.jpg"),
            ("Pio",         "Del Pilar",     "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Pio_del_Pilar.jpg/220px-Pio_del_Pilar.jpg"),
            ("Macario",     "Sakay",         "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Macario_Sakay.jpg/220px-Macario_Sakay.jpg"),
            ("Juan",        "Calle",         None),
        ]

        import random
        random.seed(42)

        humility_students = []
        for fn, ln, img in humility_students_data:
            # 80% chance they have all docs, 20% they lack some
            has_all_docs = random.random() > 0.2
            s = Student(
                first_name=fn, last_name=ln, grade_level="Grade 7", section="Humility",
                contact_email=f"parent_{fn.lower()}@cca.edu.ph", profile_image=img, 
                enrollment_status="Enrolled" if has_all_docs else "Hold: Incomplete Req",
                school_year="2025-2026",
                req_birth_cert=1 if has_all_docs else random.choice([0, 1]),
                req_form_138=1 if has_all_docs else random.choice([0, 1]),
                req_good_moral=1 if has_all_docs else random.choice([0, 1]),
                req_pictures=1 if has_all_docs else random.choice([0, 1]),
                account_username=f"{fn.lower()}_{ln.lower()}",
                initial_password="cca2026"
            )
            humility_students.append(s)
        db.add_all(humility_students)

        # --- Additional students in other sections ---
        other_students_data = [
            ("Andres",  "Bonifacio",   "Grade 8",  "Courage",     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Andr%C3%A9s_Bonifacio.jpg/220px-Andr%C3%A9s_Bonifacio.jpg"),
            ("Emilio",  "Jacinto",     "Grade 8",  "Courage",     "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Emilio_Jacinto.jpg/220px-Emilio_Jacinto.jpg"),
            ("Heneral", "Pio",         "Grade 8",  "Courage",     None),
            ("Jose",    "Rizal",       "Grade 9",  "Goodwill",    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Jose_Rizal_full.jpg/220px-Jose_Rizal_full.jpg"),
            ("Caridad", "Cruz",        "Grade 9",  "Goodwill",    None),
            ("Lucio",   "San Pedro",   "Grade 10", "Persistence", None),
            ("Imelda",  "Marcos",      "Grade 10", "Persistence", None),
        ]
        other_students = []
        for fn, ln, gl, sec, img in other_students_data:
            has_all_docs = random.random() > 0.2
            s = Student(
                first_name=fn, last_name=ln, grade_level=gl, section=sec,
                contact_email=f"parent_{fn.lower()}@cca.edu.ph", profile_image=img, 
                enrollment_status="Enrolled" if has_all_docs else "Hold: Incomplete Req",
                school_year="2025-2026",
                req_birth_cert=1 if has_all_docs else random.choice([0, 1]),
                req_form_138=1 if has_all_docs else random.choice([0, 1]),
                req_good_moral=1 if has_all_docs else random.choice([0, 1]),
                req_pictures=1 if has_all_docs else random.choice([0, 1]),
                account_username=f"{fn.lower()}_{ln.lower()}",
                initial_password="cca2026"
            )
            other_students.append(s)
        db.add_all(other_students)
        db.commit()

        # Link student user to first student (Juan Dela Cruz)
        student_user.student_id = humility_students[0].id

        # --- Create Users for all mock students ---
        student_users = []
        for s in humility_students + other_students:
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

        # --- Academic Records for Humility section & Others (for AI warning testing) ---
        subjects = ["Mathematics", "Science", "Filipino", "English", "Araling Panlipunan (AP)", "Edukasyon sa Pagpapakatao (EsP)", "Technology and Livelihood Education (TLE)", "MAPEH"]
        import random
        from datetime import date, timedelta
        random.seed(42)
        records = []
        for s in humility_students + other_students:
            for subj in subjects:
                for term in ["1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter"]:
                    # Create a failing trend for Science and Math randomly
                    score_base = random.randint(76, 95)
                    if subj in ["Mathematics", "Science"] and s.first_name in ["Juan", "Maria"]:
                        score_base = max(65, 80 - (int(term[0]) * 5)) # Dropping scores
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
