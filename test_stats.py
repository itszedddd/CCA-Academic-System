from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))
import app.models as models

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./backend/cca.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

all_students = db.query(models.Student).filter(models.Student.is_archived == 0).all()
enrolled_forms = db.query(models.EnrollmentForm).all()
new_student_ids = set(f.student_id for f in enrolled_forms if f.student_id)

old_students = [s for s in all_students if s.id not in new_student_ids]
new_students = [s for s in all_students if s.id in new_student_ids]

print(f"Total: {len(all_students)}, Old: {len(old_students)}, New: {len(new_students)}")
