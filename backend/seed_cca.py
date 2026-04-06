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

        humility_students = []
        for fn, ln, img in humility_students_data:
            s = Student(first_name=fn, last_name=ln, grade_level="Grade 7", section="Humility",
                        contact_email=f"parent_{fn.lower()}@cca.edu.ph", profile_image=img, enrollment_status="Enrolled")
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
            s = Student(first_name=fn, last_name=ln, grade_level=gl, section=sec,
                        contact_email=f"parent_{fn.lower()}@cca.edu.ph", profile_image=img, enrollment_status="Enrolled")
            other_students.append(s)
        db.add_all(other_students)
        db.commit()

        # Link student user to first student (Juan Dela Cruz)
        student_user.student_id = humility_students[0].id

        # --- Academic Records for Humility section (for AI warning testing) ---
        subjects = ["Math", "Science", "Filipino", "English", "Social Studies"]
        import random
        random.seed(42)
        records = []
        for s in humility_students[:10]:
            for subj in subjects[:3]:
                for term, score_range in [("1st Grading", (70, 95)), ("2nd Grading", (60, 85)), ("3rd Grading", (50, 75))]:
                    records.append(AcademicRecord(student_id=s.id, subject=subj,
                                                   score=round(random.uniform(*score_range), 1), term=term))
        db.add_all(records)

        # --- Tuition Payments ---
        payments = []
        statuses = ["Paid", "Pending", "Overdue"]
        for idx, s in enumerate(humility_students + other_students):
            payments.append(TuitionPayment(
                student_id=s.id,
                amount_due=35000.00,
                amount_paid=round(random.uniform(0, 35000), 2),
                term="Term 1",
                status=statuses[idx % 3],
                risk_score=round(random.uniform(0.1, 0.95), 2)
            ))
        db.add_all(payments)
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
