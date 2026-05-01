from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil

from .. import models, schemas
from ..database import get_db
from ..utils import validate_required_fields, check_duplicate_student
from ..ai_engine import analyze_grade_trend, predict_tuition_default
from ..auth import get_password_hash, verify_password, create_access_token, get_current_active_user

aesms_router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------

@aesms_router.get("/students/", response_model=List[schemas.Student])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role == "Teacher":
        # Teachers only see students in their assigned section
        assigned = getattr(current_user, 'section', None)
        if not assigned:
            return []  # No section assigned — show nothing (secure default)
        return db.query(models.Student).filter(models.Student.section == assigned).all()
    if current_user.role not in ["Principal", "Registrar", "Admission", "Cashier"]:
        # Students/Parents see only themselves
        return db.query(models.Student).filter(models.Student.id == current_user.student_id).all()
    return db.query(models.Student).offset(skip).limit(limit).all()

@aesms_router.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_student = models.Student(**student.model_dump())
    
    # Auto-generate account details
    fn = (db_student.first_name or "student").strip().lower().replace(" ", "_")
    ln = (db_student.last_name or "").strip()
    base_username = fn
    count = db.query(models.User).filter(models.User.username.like(f"{base_username}%")).count()
    if count > 0:
        base_username = f"{base_username}{count+1}"
        
    initial_pw = f"{ln}cca2026"
    if not initial_pw.strip():
        initial_pw = "cca2026"
        
    db_student.account_username = base_username
    db_student.initial_password = initial_pw
    
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    # Create the actual User record
    new_user = models.User(
        username=base_username,
        hashed_password=get_password_hash(initial_pw),
        role="Student",
        student_id=db_student.id,
        is_active=1
    )
    db.add(new_user)
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
    old_grade = student.grade_level
    for key, value in student_update.model_dump().items():
        setattr(student, key, value)
        
    new_grade = student.grade_level
    if old_grade and new_grade and old_grade != new_grade and "Grade" in old_grade and "Grade" in new_grade:
        try:
            old_num = int(old_grade.split()[1])
            new_num = int(new_grade.split()[1])
            if new_num > old_num and student.school_year:
                parts = student.school_year.split('-')
                if len(parts) == 2:
                    student.school_year = f"{int(parts[0])+1}-{int(parts[1])+1}"
        except:
            pass
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
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission"]:
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
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    # Teachers can only add grades for students in their assigned section
    if current_user.role == "Teacher":
        assigned = getattr(current_user, 'section', None)
        if not assigned:
            raise HTTPException(status_code=403, detail="No section assigned to your account")
        student = db.query(models.Student).filter(models.Student.id == record.student_id).first()
        if not student or student.section != assigned:
            raise HTTPException(status_code=403, detail="Student is not in your assigned section")
    db_record = models.AcademicRecord(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@aesms_router.put("/academic_records/{record_id}", response_model=schemas.AcademicRecord)
def update_academic_record(record_id: int, record_update: schemas.AcademicRecordBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    record = db.query(models.AcademicRecord).filter(models.AcademicRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    # Teachers can only edit grades for students in their section
    if current_user.role == "Teacher":
        assigned = getattr(current_user, 'section', None)
        student = db.query(models.Student).filter(models.Student.id == record.student_id).first()
        if not assigned or not student or student.section != assigned:
            raise HTTPException(status_code=403, detail="Student is not in your assigned section")
    for key, value in record_update.model_dump().items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


@aesms_router.post("/tuition/{tuition_id}/pay", response_model=schemas.PaymentRecord)
def record_tuition_payment(tuition_id: int, payment: schemas.PaymentRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Cashier"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    tuition = db.query(models.TuitionPayment).filter(models.TuitionPayment.id == tuition_id).first()
    if not tuition:
        raise HTTPException(status_code=404, detail="Tuition not found")

    db_pay = models.PaymentRecord(
        tuition_id=tuition_id,
        amount=payment.amount,
        or_number=payment.or_number,
        date_recorded=payment.date_recorded,
        recorded_by=current_user.id
    )
    db.add(db_pay)

    # Auto update ledger 
    tuition.amount_paid += payment.amount
    if tuition.amount_paid >= tuition.amount_due:
        tuition.status = "Paid"
    elif tuition.amount_paid > 0 and tuition.status == "Paid":
        tuition.status = "Pending"
        
    db.commit()
    db.refresh(db_pay)
    return db_pay


# ---------------------------------------------------------------------------
# Attendance
# ---------------------------------------------------------------------------

@aesms_router.post("/attendance/", response_model=schemas.Attendance)
def create_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    student = db.query(models.Student).filter(models.Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    existings = db.query(models.Attendance).filter(
        models.Attendance.student_id == attendance.student_id,
        models.Attendance.date == attendance.date
    ).all()

    for ex in existings:
        db.delete(ex)

    if attendance.status == "Clear":
        db.commit()
        return models.Attendance(id=0, student_id=attendance.student_id, date=attendance.date, status="Clear")

    db_record = models.Attendance(**attendance.model_dump())
    db_record.recorded_by = current_user.id
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@aesms_router.get("/attendance/", response_model=List[schemas.Attendance])
def get_attendance(skip: int = 0, limit: int = 500, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    query = db.query(models.Attendance)
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission"]:
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
    
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission", "Cashier"]:
        # Only check for the logged-in student
        if not current_user.student_id:
            return {"total_warnings": 0, "warnings": []}
        students = db.query(models.Student).filter(models.Student.id == current_user.student_id).all()
    else:
        students = db.query(models.Student).all()

    for student in students:
        # 1. Document Lacking Warnings
        if not student.req_birth_cert or not student.req_form_138 or not student.req_good_moral or not student.req_pictures:
            missing_docs = []
            if not student.req_birth_cert: missing_docs.append("Birth Cert")
            if not student.req_form_138: missing_docs.append("Form 138")
            if not student.req_good_moral: missing_docs.append("Good Moral")
            if not student.req_pictures: missing_docs.append("Pictures")
            
            warnings.append({
                "student_id": student.id,
                "student_name": f"{student.first_name} {student.last_name}",
                "subject": "Requirements",
                "slope": 0.0,
                "message": f"Action Required: Lacking documents ({', '.join(missing_docs)}). Please notify student.",
                "latest_score": 0.0,
            })
            
        # 2. Academic Trend Warnings
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
# Tuition Payments & AI Risk Prediction
# ---------------------------------------------------------------------------

@aesms_router.get("/tuition/", response_model=List[schemas.TuitionPayment])
def get_tuition(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Teacher", "Admission", "Cashier"]:
        return db.query(models.TuitionPayment).filter(models.TuitionPayment.student_id == current_user.student_id).all()
    return db.query(models.TuitionPayment).all()

@aesms_router.post("/tuition/", response_model=schemas.TuitionPayment)
def create_tuition(tuition: schemas.TuitionPaymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Cashier"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Recalculate risk score via ML engine
    all_student_payments = db.query(models.TuitionPayment).filter(models.TuitionPayment.student_id == tuition.student_id).all()
    
    balances = [p.amount_due for p in all_student_payments] + [tuition.amount_due]
    payments = [p.amount_paid for p in all_student_payments] + [tuition.amount_paid]
    statuses = [p.status for p in all_student_payments] + [tuition.status]
    
    risk_data = predict_tuition_default(balances, payments, statuses)
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
    statuses = [p.status for p in all_student_payments]
    risk_data = predict_tuition_default(balances, payments, statuses)
    tuition.risk_score = risk_data["risk_score"]
    
    db.commit()
    db.refresh(tuition)
    return tuition

# ---------------------------------------------------------------------------
# Analytics & Intelligent Reports
# ---------------------------------------------------------------------------

@aesms_router.get("/analytics/report")
def get_analytics_report(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission", "Cashier"]:
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
# Enrollment Forms (Structured Digital Form)
# ---------------------------------------------------------------------------

@aesms_router.get("/students/lookup")
def lookup_student(
    first_name: str = Query(...),
    last_name: str = Query(...),
    db: Session = Depends(get_db)
):
    """Auto-fill endpoint: returns existing student data for returning students."""
    student = check_duplicate_student(db, models.Student, first_name, last_name)
    if not student:
        return {"found": False}
    return {
        "found": True,
        "student_id": student.id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "grade_level": student.grade_level,
        "section": student.section,
        "contact_email": student.contact_email,
        "school_year": student.school_year,
        "enrollment_status": student.enrollment_status,
    }

@aesms_router.post("/enrollment_forms/", response_model=schemas.EnrollmentForm)
def create_enrollment_form(
    payload: schemas.EnrollmentFormCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Creates a structured enrollment form. Auto-links or creates a student record."""
    if current_user.role not in ["Principal", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Auto-create or link student record
    existing = check_duplicate_student(
        db, models.Student, payload.student_first_name, payload.student_last_name
    )
    if existing:
        student_id = existing.id
    else:
        new_student = models.Student(
            first_name=payload.student_first_name.strip(),
            last_name=payload.student_last_name.strip(),
            grade_level=payload.grade_applying_for or "Pending",
            enrollment_status="Pending Validation"
        )
        db.add(new_student)
        db.flush()
        student_id = new_student.id

    db_form = models.EnrollmentForm(
        student_id=student_id,
        form_type=payload.form_type,
        status="Needs Review",
        sex=payload.sex,
        birth_date=payload.birth_date,
        birth_place=payload.birth_place,
        home_address=payload.home_address,
        father_name=payload.father_name,
        father_contact=payload.father_contact,
        father_occupation=payload.father_occupation,
        father_employer=payload.father_employer,
        mother_name=payload.mother_name,
        mother_contact=payload.mother_contact,
        mother_occupation=payload.mother_occupation,
        mother_employer=payload.mother_employer,
        church_attended=payload.church_attended,
        church_member=payload.church_member,
        pastor_name=payload.pastor_name,
        previous_school=payload.previous_school,
        grade_applying_for=payload.grade_applying_for,
        repeated_grade=payload.repeated_grade,
        expelled_dismissed=payload.expelled_dismissed,
        learning_disabilities=payload.learning_disabilities,
        special_talents=payload.special_talents,
        how_heard=payload.how_heard,
        reason_selecting=payload.reason_selecting,
        submitted_by=current_user.id,
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@aesms_router.post("/enrollment_forms/{form_id}/upload_document")
async def upload_enrollment_document(
    form_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Uploads a supporting document (birth cert, Form 138, etc.) to an enrollment form."""
    import time
    if current_user.role not in ["Principal", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    form = db.query(models.EnrollmentForm).filter(models.EnrollmentForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    unique_name = f"doc_{int(time.time())}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Append to existing file paths (comma-separated)
    if form.file_path:
        form.file_path = form.file_path + "," + file_path
    else:
        form.file_path = file_path

    db.commit()
    db.refresh(form)
    return {"detail": "Document uploaded", "file_path": file_path}

@aesms_router.get("/enrollment_forms/", response_model=List[schemas.EnrollmentForm])
def read_enrollment_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.EnrollmentForm).order_by(models.EnrollmentForm.id.desc()).offset(skip).limit(limit).all()

@aesms_router.get("/enrollment_forms/check_duplicate")
def check_duplicate_form(student_id: int, form_type: str, db: Session = Depends(get_db)):
    existing = db.query(models.EnrollmentForm).filter(
        models.EnrollmentForm.student_id == student_id,
        models.EnrollmentForm.form_type == form_type
    ).first()
    return {"exists": existing is not None, "form_id": existing.id if existing else None}

@aesms_router.put("/enrollment_forms/{form_id}/verify", response_model=schemas.EnrollmentForm)
def verify_form(form_id: int, payload: schemas.EnrollmentFormVerify, db: Session = Depends(get_db)):
    # Grade-to-Section mapping for automatic assignment
    GRADE_SECTION_MAP = {
        'Grade 7': 'Humility',
        'Grade 8': 'Courage',
        'Grade 9': 'Goodwill',
        'Grade 10': 'Persistence',
    }

    form = db.query(models.EnrollmentForm).filter(models.EnrollmentForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    form.status = payload.status
    if payload.remarks:
        form.remarks = payload.remarks
    
    if payload.status in ["Success", "Hold", "Approved Incomplete"]:
        if form.student_id:
            student = db.query(models.Student).filter(models.Student.id == form.student_id).first()
            if student:
                student.req_birth_cert = payload.req_birth_cert
                student.req_form_138 = payload.req_form_138
                student.req_good_moral = payload.req_good_moral
                student.req_pictures = payload.req_pictures

                if payload.status == "Success":
                    student.enrollment_status = "Enrolled"
                    # Auto-assign section based on grade level
                    grade = student.grade_level or (form.grade_applying_for or '')
                    if grade in GRADE_SECTION_MAP:
                        student.section = GRADE_SECTION_MAP[grade]
                elif payload.status == "Approved Incomplete":
                    student.enrollment_status = "Approved: Incomplete Req"
                    # Still auto-assign section even if incomplete
                    grade = student.grade_level or (form.grade_applying_for or '')
                    if grade in GRADE_SECTION_MAP:
                        student.section = GRADE_SECTION_MAP[grade]
                elif payload.status == "Hold":
                    student.enrollment_status = "Hold: Incomplete Req"
                
            user = db.query(models.User).filter(models.User.student_id == form.student_id).first()
            if user:
                if hasattr(user, 'is_active') and user.is_active == 0:
                    user.is_active = 1
            else:
                fn = payload.student_first_name or (student.first_name if student else f"student_{form.student_id}")
                ln = payload.student_last_name or (student.last_name if student else "")
                dob = payload.student_dob or "cca2026"
                
                base_username = fn.strip().lower().replace(" ", "_")
                count = db.query(models.User).filter(models.User.username.like(f"{base_username}%")).count()
                if count > 0:
                    base_username = f"{base_username}{count+1}"
                
                initial_pw = f"{ln}{dob}".strip()
                if not initial_pw:
                    initial_pw = "cca2026"
                
                if student:
                    student.account_username = base_username
                    student.initial_password = initial_pw
                
                new_user = models.User(
                    username=base_username,
                    hashed_password=get_password_hash(initial_pw),
                    role="Student",
                    student_id=form.student_id,
                    is_active=1
                )
                db.add(new_user)
                
    db.commit()
    db.refresh(form)
    return form


# ---------------------------------------------------------------------------
# Users & Auth
# ---------------------------------------------------------------------------


@aesms_router.post("/auth/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    username_clean = username.strip().lower()
    user = db.query(models.User).filter(models.User.username == username_clean).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    if getattr(user, 'is_active', 1) == 0:
        raise HTTPException(status_code=403, detail="Account pending Registrar verification")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@aesms_router.get("/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user

from pydantic import BaseModel
class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

@aesms_router.post("/auth/change-password")
def change_password(request: PasswordChangeRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if not verify_password(request.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

class ScheduleUpdateRequest(BaseModel):
    schedule: str  # JSON string

@aesms_router.put("/auth/update-schedule")
def update_schedule(request: ScheduleUpdateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    current_user.schedule = request.schedule
    db.commit()
    return {"message": "Schedule updated successfully"}

@aesms_router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Superadmin", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions to create users")
    if current_user.role in ["Registrar", "Admission"] and user.role != "Student":
        raise HTTPException(status_code=403, detail="Registrars can only create Student accounts")
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    db_user = models.User(
        username=user.username,
        role=user.role,
        student_id=user.student_id,
        is_active=getattr(user, 'is_active', 1),
        section=getattr(user, 'section', None),
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@aesms_router.get("/users/", response_model=List[schemas.User])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Superadmin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db.query(models.User).all()

@aesms_router.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Superadmin":
        raise HTTPException(status_code=403, detail="Only admins can edit users")
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
         raise HTTPException(status_code=404, detail="User not found")
         
    db_user.username = user.username
    db_user.role = user.role
    db_user.is_active = user.is_active
    db_user.student_id = user.student_id
    db_user.section = getattr(user, 'section', None)
    
    if user.password and str(user.password).strip() != "":
        db_user.hashed_password = get_password_hash(str(user.password).strip())
        
    db.commit()
    db.refresh(db_user)
    return db_user

@aesms_router.post("/users/{user_id}/upload_profile_picture")
async def upload_user_profile_picture(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Upload a profile picture for a user (Teacher/Student). Users can only update their own picture."""
    if current_user.id != user_id and current_user.role != "Superadmin":
        raise HTTPException(status_code=403, detail="You can only update your own profile picture")
    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    import time
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"user_{user_id}_{int(time.time())}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_url = f"/uploads/{file_name}"
    db_user.profile_picture = file_url
    
    db.commit()
    db.refresh(db_user)
    return {"detail": "Profile picture updated", "profile_picture": file_url}

@aesms_router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Superadmin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted"}

@aesms_router.get("/debug/seed")
def debug_seed_db(db: Session = Depends(get_db)):
    try:
        from seed_cca import seed_data
        seed_data()
        count = db.query(models.User).count()
        return {"status": "success", "users_count": count}
    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}
