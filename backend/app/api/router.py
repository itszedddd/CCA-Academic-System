from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List
from collections import defaultdict
import os
import shutil

from .. import models, schemas
from ..database import get_db
from ..utils import extract_text_from_image
from ..ai_engine import analyze_grade_trend, suggest_resources, predict_tuition_default
from ..auth import get_password_hash, verify_password, create_access_token, get_current_active_user

aesms_router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------

@aesms_router.get("/students/", response_model=List[schemas.Student])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Administrator", "Teacher", "Registrar", "Cashier"]:
        # Students can only see themselves
        return db.query(models.Student).filter(models.Student.id == current_user.student_id).all()
    return db.query(models.Student).offset(skip).limit(limit).all()

@aesms_router.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Administrator", "Teacher", "Registrar"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_student = models.Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@aesms_router.get("/students/{student_id}", response_model=schemas.Student)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@aesms_router.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student_update: schemas.StudentCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in student_update.model_dump().items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student

@aesms_router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"detail": "Student deleted"}

@aesms_router.post("/students/{student_id}/upload_image")
async def upload_student_image(
    student_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    if current_user.role not in ["Administrator", "Teacher", "Registrar"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    import time
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"student_{student_id}_{int(time.time())}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_url = f"/uploads/{file_name}"
    student.profile_image = file_url
    
    db.commit()
    db.refresh(student)
    return student


# ---------------------------------------------------------------------------
# Academic Records
# ---------------------------------------------------------------------------

@aesms_router.post("/academic_records/", response_model=schemas.AcademicRecord)
def create_academic_record(record: schemas.AcademicRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Administrator", "Teacher", "Registrar"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_record = models.AcademicRecord(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@aesms_router.put("/academic_records/{record_id}", response_model=schemas.AcademicRecord)
def update_academic_record(record_id: int, record_update: schemas.AcademicRecordBase, db: Session = Depends(get_db)):
    record = db.query(models.AcademicRecord).filter(models.AcademicRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for key, value in record_update.model_dump().items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


# ---------------------------------------------------------------------------
# Attendance
# ---------------------------------------------------------------------------

@aesms_router.post("/attendance/", response_model=schemas.Attendance)
def create_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Administrator", "Teacher", "Registrar"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    student = db.query(models.Student).filter(models.Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db_record = models.Attendance(**attendance.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@aesms_router.get("/attendance/", response_model=List[schemas.Attendance])
def get_attendance(skip: int = 0, limit: int = 500, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    query = db.query(models.Attendance)
    if current_user.role not in ["Administrator", "Teacher", "Registrar"]:
        query = query.filter(models.Attendance.student_id == current_user.student_id)
    return (
        query.order_by(models.Attendance.id.desc())
        .offset(skip).limit(limit).all()
    )

@aesms_router.get("/attendance/student/{student_id}", response_model=List[schemas.Attendance])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return (
        db.query(models.Attendance)
        .filter(models.Attendance.student_id == student_id)
        .order_by(models.Attendance.date.desc())
        .all()
    )


# ---------------------------------------------------------------------------
# AI: Academic Warnings (Predictive Performance Analytics)
# ---------------------------------------------------------------------------

@aesms_router.get("/academic_warnings/")
def check_academic_warnings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    warnings = []
    
    if current_user.role not in ["Administrator", "Teacher", "Registrar", "Cashier"]:
        # Only check for the logged-in student
        if not current_user.student_id:
            return {"total_warnings": 0, "warnings": []}
        students = db.query(models.Student).filter(models.Student.id == current_user.student_id).all()
    else:
        students = db.query(models.Student).all()

    for student in students:
        records = (
            db.query(models.AcademicRecord)
            .filter(models.AcademicRecord.student_id == student.id)
            .order_by(models.AcademicRecord.id)
            .all()
        )
        subjects = set(r.subject for r in records)

        for subject in subjects:
            subject_scores = [r.score for r in records if r.subject == subject]
            if len(subject_scores) >= 3:
                analysis = analyze_grade_trend(subject_scores)
                if analysis["has_warning"]:
                    warnings.append({
                        "student_id": student.id,
                        "student_name": f"{student.first_name} {student.last_name}",
                        "subject": subject,
                        "slope": analysis["slope"],
                        "message": analysis["message"],
                        "latest_score": analysis["latest_score"],
                    })

    return {"total_warnings": len(warnings), "warnings": warnings}


# ---------------------------------------------------------------------------
# AI: Resource Recommendation Engine
# ---------------------------------------------------------------------------

@aesms_router.get("/resource_recommendations/{student_id}", response_model=List[schemas.ResourceRecommendation])
def get_resource_recommendations(student_id: int, db: Session = Depends(get_db)):
    """Returns AI-driven study resource recommendations for a student's weakest subjects."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    records = db.query(models.AcademicRecord).filter(
        models.AcademicRecord.student_id == student_id
    ).all()
    if not records:
        return []

    subject_scores: dict[str, list[float]] = defaultdict(list)
    for r in records:
        subject_scores[r.subject].append(r.score)

    subject_averages = {s: sum(sc) / len(sc) for s, sc in subject_scores.items()}
    raw = suggest_resources(subject_averages)
    return [schemas.ResourceRecommendation(**rec) for rec in raw]


# ---------------------------------------------------------------------------
# Tuition Payments & AI Risk Prediction
# ---------------------------------------------------------------------------

@aesms_router.get("/tuition/", response_model=List[schemas.TuitionPayment])
def get_tuition(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Administrator", "Teacher", "Cashier"]:
        return db.query(models.TuitionPayment).filter(models.TuitionPayment.student_id == current_user.student_id).all()
    return db.query(models.TuitionPayment).all()

@aesms_router.post("/tuition/", response_model=schemas.TuitionPayment)
def create_tuition(tuition: schemas.TuitionPaymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Administrator", "Cashier"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Recalculate risk score via ML engine
    all_student_payments = db.query(models.TuitionPayment).filter(models.TuitionPayment.student_id == tuition.student_id).all()
    
    balances = [p.amount_due for p in all_student_payments] + [tuition.amount_due]
    payments = [p.amount_paid for p in all_student_payments] + [tuition.amount_paid]
    
    risk_data = predict_tuition_default(balances, payments)
    tuition.risk_score = risk_data["risk_score"]
    
    db_tuition = models.TuitionPayment(**tuition.model_dump())
    db.add(db_tuition)
    db.commit()
    db.refresh(db_tuition)
    return db_tuition

@aesms_router.put("/tuition/{tuition_id}", response_model=schemas.TuitionPayment)
def update_tuition(tuition_id: int, tuition_update: schemas.TuitionPaymentCreate, db: Session = Depends(get_db)):
    tuition = db.query(models.TuitionPayment).filter(models.TuitionPayment.id == tuition_id).first()
    if not tuition:
        raise HTTPException(status_code=404, detail="Tuition not found")
    
    for key, value in tuition_update.model_dump().items():
        setattr(tuition, key, value)
        
    db.commit()
    
    # Update risk for all future payments
    all_student_payments = db.query(models.TuitionPayment).filter(models.TuitionPayment.student_id == tuition.student_id).all()
    balances = [p.amount_due for p in all_student_payments]
    payments = [p.amount_paid for p in all_student_payments]
    risk_data = predict_tuition_default(balances, payments)
    tuition.risk_score = risk_data["risk_score"]
    
    db.commit()
    db.refresh(tuition)
    return tuition

# ---------------------------------------------------------------------------
# Analytics & Intelligent Reports
# ---------------------------------------------------------------------------

@aesms_router.get("/analytics/report")
def get_analytics_report(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Administrator", "Teacher", "Registrar", "Cashier"]:
        raise HTTPException(status_code=403, detail="Admins only")
        
    students = db.query(models.Student).all()
    tuitions = db.query(models.TuitionPayment).all()
    records = db.query(models.AcademicRecord).all()
    
    total_students = len(students)
    enrolled_students = len([s for s in students if s.enrollment_status == "Enrolled"])
    
    total_due = sum([t.amount_due for t in tuitions])
    total_paid = sum([t.amount_paid for t in tuitions])
    outstanding_balance = total_due - total_paid
    high_risk_payments = len([t for t in tuitions if t.risk_score and t.risk_score >= 0.8])
    
    overall_avg = sum([r.score for r in records]) / len(records) if records else 0
    warnings = 0
    
    for student in students:
        student_records = [r for r in records if r.student_id == student.id]
        subjects = set(r.subject for r in student_records)
        for subject in subjects:
            subj_scores = [r.score for r in student_records if r.subject == subject]
            if len(subj_scores) >= 3:
                analysis = analyze_grade_trend(subj_scores)
                if analysis["has_warning"]:
                    warnings += 1
                    break
    
    return {
        "institution": "Calvary Christian Academy",
        "total_students": total_students,
        "enrolled_students": enrolled_students,
        "total_tuition_due": total_due,
        "total_tuition_collected": total_paid,
        "outstanding_balance": outstanding_balance,
        "high_risk_tuition_flags": high_risk_payments,
        "global_academic_average": round(overall_avg, 2),
        "active_academic_warnings": warnings
    }

# ---------------------------------------------------------------------------
# Enrollment Forms (OCR)
# ---------------------------------------------------------------------------

@aesms_router.post("/enrollment_forms/", response_model=schemas.EnrollmentForm)
async def upload_enrollment_form(
    student_id: int = Form(None),
    form_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    with open(file_path, "rb") as f:
        file_bytes = f.read()
    extracted_text = extract_text_from_image(file_bytes)
    status = "Needs Review" if "ERROR" in extracted_text else "Success"
    if not extracted_text:
        status = "Failed Extraction"
    db_form = models.EnrollmentForm(
        student_id=student_id, form_type=form_type,
        file_path=file_path, extracted_text=extracted_text, status=status
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@aesms_router.get("/enrollment_forms/", response_model=List[schemas.EnrollmentForm])
def read_enrollment_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.EnrollmentForm).order_by(models.EnrollmentForm.id.desc()).offset(skip).limit(limit).all()

@aesms_router.put("/enrollment_forms/{form_id}/verify", response_model=schemas.EnrollmentForm)
def verify_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.EnrollmentForm).filter(models.EnrollmentForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    form.status = "Success"
    
    if form.student_id:
        student = db.query(models.Student).filter(models.Student.id == form.student_id).first()
        if student and student.enrollment_status == "Pending Validation":
            student.enrollment_status = "Enrolled"
            
        user = db.query(models.User).filter(models.User.student_id == form.student_id).first()
        if user and hasattr(user, 'is_active') and user.is_active == 0:
            user.is_active = 1
            
    db.commit()
    db.refresh(form)
    return form


# ---------------------------------------------------------------------------
# Users & Auth
# ---------------------------------------------------------------------------

@aesms_router.post("/auth/register")
async def register_student(
    first_name: str = Form(...),
    last_name: str = Form(...),
    grade_level: str = Form(...),
    section: str = Form(None),
    contact_email: str = Form(None),
    username: str = Form(...),
    password: str = Form(...),
    profile_picture: UploadFile = File(None),
    enrollment_form: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    import time
    existing = db.query(models.User).filter(models.User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
        
    profile_url = None
    if profile_picture and profile_picture.filename:
        ext = os.path.splitext(profile_picture.filename)[1]
        pic_name = f"pf_{int(time.time())}{ext}"
        pic_path = os.path.join(UPLOAD_DIR, pic_name)
        with open(pic_path, "wb") as buffer:
            shutil.copyfileobj(profile_picture.file, buffer)
        profile_url = f"/uploads/{pic_name}"
        
    student = models.Student(
        first_name=first_name,
        last_name=last_name,
        grade_level=grade_level,
        section=section,
        contact_email=contact_email,
        profile_image=profile_url,
        enrollment_status="Pending Validation"
    )
    db.add(student)
    db.flush()
    
    hashed = get_password_hash(password)
    user = models.User(
        username=username,
        role="Student",
        student_id=student.id,
        is_active=0,
        hashed_password=hashed
    )
    db.add(user)
    db.flush()
    
    form_path = os.path.join(UPLOAD_DIR, f"form_{int(time.time())}_{enrollment_form.filename}")
    with open(form_path, "wb") as buffer:
        shutil.copyfileobj(enrollment_form.file, buffer)
        
    with open(form_path, "rb") as f:
        file_bytes = f.read()
        
    extracted_text = extract_text_from_image(file_bytes)
    status = "Needs Review" if "ERROR" in extracted_text else "Success"
    if not extracted_text:
        status = "Failed Extraction"
        
    db_form = models.EnrollmentForm(
        student_id=student.id,
        form_type="Pre-Registration Application",
        file_path=form_path,
        extracted_text=extracted_text,
        status=status
    )
    db.add(db_form)
    db.commit()
    return {"detail": "Application submitted successfully", "status": "Pending"}

@aesms_router.post("/auth/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    if getattr(user, 'is_active', 1) == 0:
        raise HTTPException(status_code=403, detail="Account pending Registrar verification")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@aesms_router.get("/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user

@aesms_router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Only admins can create users")
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    db_user = models.User(
        username=user.username,
        role=user.role,
        student_id=user.student_id,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@aesms_router.get("/users/", response_model=List[schemas.User])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db.query(models.User).all()

@aesms_router.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Only admins can edit users")
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
         raise HTTPException(status_code=404, detail="User not found")
         
    db_user.username = user.username
    db_user.role = user.role
    db_user.is_active = user.is_active
    db_user.student_id = user.student_id
    
    if user.password and str(user.password).strip() != "":
        db_user.hashed_password = get_password_hash(str(user.password).strip())
        
    db.commit()
    db.refresh(db_user)
    return db_user

@aesms_router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted"}
