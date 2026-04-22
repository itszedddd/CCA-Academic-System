from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import EnrollmentForm

engine = create_engine("sqlite:///./cca.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

forms = db.query(EnrollmentForm).all()
for f in forms:
    print(f"=== DOC-{str(f.id).zfill(4)} | Status: {f.status} | Type: {f.form_type} | Student ID: {f.student_id} ===")
    print(f"Extracted text ({len(f.extracted_text or '')} chars):")
    print((f.extracted_text or 'NONE')[:800])
    print("---\n")

db.close()
