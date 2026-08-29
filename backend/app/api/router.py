from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import os
import shutil
from datetime import datetime, date
from pydantic import BaseModel

from .. import models, schemas
from ..database import get_db
from ..utils import validate_required_fields, check_duplicate_student
from ..ai_engine import analyze_grade_trend, predict_tuition_default, get_ai_model_summary, generate_dashboard_insights, generate_ai_report
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
def get_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@aesms_router.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student_update: schemas.StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Teacher", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
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
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Registrar"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
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
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif"}
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and GIF are allowed.")

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

    all_remarks = db.query(models.AcademicWarningRemarks).filter(
        models.AcademicWarningRemarks.student_id.in_([s.id for s in students])
    ).all()
    remarks_dict = {(r.student_id, r.subject): r.remarks for r in all_remarks}

    # Pre-fetch all attendance records for efficiency
    student_ids = [s.id for s in students]
    all_attendance = db.query(models.Attendance).filter(
        models.Attendance.student_id.in_(student_ids)
    ).all()
    # Build attendance lookup: {student_id: {total_days, total_absences, total_lates}}
    attendance_lookup = {}
    for att in all_attendance:
        if att.student_id not in attendance_lookup:
            attendance_lookup[att.student_id] = {"total_days": 0, "total_absences": 0, "total_lates": 0}
        attendance_lookup[att.student_id]["total_days"] += 1
        if att.status == "Absent":
            attendance_lookup[att.student_id]["total_absences"] += 1
        elif att.status == "Late":
            attendance_lookup[att.student_id]["total_lates"] += 1

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
                "remarks": remarks_dict.get((student.id, "Requirements"), "")
            })
            
        # 2. AI-Powered Academic Trend Warnings (with attendance data)
        records = (
            db.query(models.AcademicRecord)
            .filter(models.AcademicRecord.student_id == student.id)
            .order_by(models.AcademicRecord.id)
            .all()
        )
        subjects = set(r.subject for r in records)
        student_attendance = attendance_lookup.get(student.id, None)

        for subject in subjects:
            subject_scores = [r.score for r in records if r.subject == subject]
            if len(subject_scores) >= 3:
                analysis = analyze_grade_trend(subject_scores, attendance_data=student_attendance)
                if analysis["has_warning"]:
                    warnings.append({
                        "student_id": student.id,
                        "student_name": f"{student.first_name} {student.last_name}",
                        "subject": subject,
                        "slope": analysis["slope"],
                        "message": analysis["message"],
                        "latest_score": analysis["latest_score"],
                        "risk_probability": analysis.get("risk_probability", 0.0),
                        "model_type": analysis.get("model_type", "N/A"),
                        "remarks": remarks_dict.get((student.id, subject), "")
                    })

    return {"total_warnings": len(warnings), "warnings": warnings}

class RemarkUpdate(BaseModel):
    student_id: int
    subject: str
    remarks: str

@aesms_router.post("/academic_warnings/remarks")
def update_academic_warning_remark(remark: RemarkUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Teacher":
        raise HTTPException(status_code=403, detail="Only teachers can update remarks")
    
    db_remark = db.query(models.AcademicWarningRemarks).filter(
        models.AcademicWarningRemarks.student_id == remark.student_id,
        models.AcademicWarningRemarks.subject == remark.subject
    ).first()
    
    if db_remark:
        db_remark.remarks = remark.remarks
    else:
        db_remark = models.AcademicWarningRemarks(student_id=remark.student_id, subject=remark.subject, remarks=remark.remarks)
        db.add(db_remark)
        
    db.commit()
    return {"message": "Remarks updated successfully"}



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
def update_tuition(tuition_id: int, tuition_update: schemas.TuitionPaymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Cashier"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
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
# AI Model Summary (for thesis defense)
# ---------------------------------------------------------------------------

@aesms_router.get("/ai/model_summary")
def ai_model_summary():
    """Returns a detailed summary of all AI/ML models used in the system."""
    return get_ai_model_summary()


# ---------------------------------------------------------------------------
# AI Report Generation (Gemini LLM — Full Narrative Reports)
# ---------------------------------------------------------------------------

class ReportRequest(BaseModel):
    report_type: str  # institutional_summary, academic_performance, tuition_finance, attendance_analysis, student_profile
    student_id: Optional[int] = None  # Required only for student_profile

# Role access map per report type
_REPORT_ROLE_ACCESS = {
    "institutional_summary": ["Principal"],
    "academic_performance": ["Principal", "Teacher"],
    "tuition_finance": ["Principal", "Cashier"],
    "attendance_analysis": ["Principal", "Teacher"],
    "student_profile": ["Principal", "Teacher", "Registrar"],
}

@aesms_router.post("/ai/generate_report")
def generate_report(request: ReportRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Generates an AI-powered institutional or student report using Gemini."""
    
    # Validate report type
    allowed_types = list(_REPORT_ROLE_ACCESS.keys())
    if request.report_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid report type. Must be one of: {', '.join(allowed_types)}")
    
    # Check role access
    allowed_roles = _REPORT_ROLE_ACCESS[request.report_type]
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Not authorized for this report type")
    
    # Gather data based on report type
    data = _gather_report_data(request.report_type, request.student_id, db, current_user)
    
    # Generate the report
    report = generate_ai_report(request.report_type, data)
    return report


def _gather_report_data(report_type: str, student_id: Optional[int], db: Session, current_user) -> dict:
    """Gathers all relevant data from the database for the specified report type."""
    
    students = db.query(models.Student).all()
    records = db.query(models.AcademicRecord).all()
    tuitions = db.query(models.TuitionPayment).all()
    all_attendance = db.query(models.Attendance).all()
    
    # Common stats
    total_students = len(students)
    enrolled_students = len([s for s in students if s.enrollment_status == "Enrolled"])
    pending_students = len([s for s in students if s.enrollment_status in ["Pending", "Pending Validation", "Hold: Incomplete Req"]])
    
    # Grade distribution
    grade_dist = {}
    for s in students:
        gl = s.grade_level or "Unknown"
        grade_dist[gl] = grade_dist.get(gl, 0) + 1
    
    # Attendance stats
    total_att = len(all_attendance)
    present_count = len([a for a in all_attendance if a.status == "Present"])
    absence_count = len([a for a in all_attendance if a.status == "Absent"])
    late_count = len([a for a in all_attendance if a.status == "Late"])
    attendance_rate = round(present_count / total_att * 100, 1) if total_att > 0 else 0
    
    # Financial stats
    total_due = sum(t.amount_due for t in tuitions)
    total_paid = sum(t.amount_paid for t in tuitions)
    outstanding = total_due - total_paid
    collection_rate = round(total_paid / total_due * 100, 1) if total_due > 0 else 0
    high_risk = len([t for t in tuitions if t.risk_score and t.risk_score >= 0.8])
    
    # Payment status breakdown
    payment_status = {}
    for t in tuitions:
        st = t.status or "Unknown"
        payment_status[st] = payment_status.get(st, 0) + 1
    
    # Academic stats
    academic_avg = round(sum(r.score for r in records) / len(records), 1) if records else 0
    
    # Subject averages
    subject_scores = {}
    for r in records:
        if r.subject not in subject_scores:
            subject_scores[r.subject] = []
        subject_scores[r.subject].append(r.score)
    subject_averages = {s: round(sum(scores) / len(scores), 1) for s, scores in subject_scores.items()}
    
    # Warning count
    warning_count = 0
    at_risk_students = []
    for student in students:
        student_records = [r for r in records if r.student_id == student.id]
        subjects = set(r.subject for r in student_records)
        for subject in subjects:
            subj_scores = [r.score for r in student_records if r.subject == subject]
            if len(subj_scores) >= 3:
                analysis = analyze_grade_trend(subj_scores)
                if analysis["has_warning"]:
                    warning_count += 1
                    at_risk_students.append(f"{student.first_name} {student.last_name} ({subject})")
                    break
    
    # Section attendance breakdown
    section_attendance = {}
    for student in students:
        section = student.section or "Unassigned"
        if section not in section_attendance:
            section_attendance[section] = {"present": 0, "absent": 0, "late": 0, "total": 0}
        student_att = [a for a in all_attendance if a.student_id == student.id]
        for a in student_att:
            section_attendance[section]["total"] += 1
            if a.status == "Present":
                section_attendance[section]["present"] += 1
            elif a.status == "Absent":
                section_attendance[section]["absent"] += 1
            elif a.status == "Late":
                section_attendance[section]["late"] += 1
    
    # Chronic absentees
    chronic_absentees = []
    for student in students:
        student_att = [a for a in all_attendance if a.student_id == student.id]
        if len(student_att) >= 5:  # Need meaningful sample
            absences = len([a for a in student_att if a.status == "Absent"])
            if absences / len(student_att) > 0.2:
                chronic_absentees.append(f"{student.first_name} {student.last_name} ({absences}/{len(student_att)} absent)")
    
    # Format dictionary strings for readability
    grade_dist_str = ", ".join([f"Grade {k}: {v}" for k, v in grade_dist.items()]) if grade_dist else "None"
    payment_status_str = ", ".join([f"{k}: {v}" for k, v in payment_status.items()]) if payment_status else "None"
    section_att_str = "; ".join([f"{k} (Present: {v['present']}, Absent: {v['absent']}, Late: {v['late']})" for k, v in section_attendance.items()]) if section_attendance else "None"

    base_data = {
        "total_students": total_students,
        "enrolled_students": enrolled_students,
        "pending_students": pending_students,
        "grade_distribution": grade_dist_str,
        "academic_average": academic_avg,
        "subject_averages": subject_averages,
        "warning_count": warning_count,
        "at_risk_students": at_risk_students,
        "attendance_rate": attendance_rate,
        "present_count": present_count,
        "absence_count": absence_count,
        "late_count": late_count,
        "section_attendance": section_att_str,
        "chronic_absentees": chronic_absentees,
        "total_revenue_due": total_due,
        "total_revenue_collected": total_paid,
        "outstanding_balance": outstanding,
        "collection_rate": collection_rate,
        "high_risk_tuition": high_risk,
        "payment_status_breakdown": payment_status_str,
    }
    
    # For student profile, add individual student data
    if report_type == "student_profile" and student_id:
        student = db.query(models.Student).filter(models.Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Section scoping for Teachers
        if current_user.role == "Teacher":
            assigned = getattr(current_user, 'section', None)
            if assigned and student.section != assigned:
                raise HTTPException(status_code=403, detail="Student is not in your assigned section")
        
        # Academic records
        student_records = [r for r in records if r.student_id == student_id]
        academics_summary_dict = {}
        for r in student_records:
            if r.subject not in academics_summary_dict:
                academics_summary_dict[r.subject] = []
            academics_summary_dict[r.subject].append({"term": r.term, "score": r.score})
            
        academics_summary_str_list = []
        for subj, scores in academics_summary_dict.items():
            scores_str = ", ".join([f"{s['term']}: {s['score']}%" for s in scores])
            academics_summary_str_list.append(f"{subj} ({scores_str})")
        academics_summary_str = "\n".join(academics_summary_str_list) if academics_summary_str_list else "No academic records"
        
        # Attendance
        student_att = [a for a in all_attendance if a.student_id == student_id]
        att_summary = {
            "total_days": len(student_att),
            "present": len([a for a in student_att if a.status == "Present"]),
            "absent": len([a for a in student_att if a.status == "Absent"]),
            "late": len([a for a in student_att if a.status == "Late"]),
        }
        att_rate = round(att_summary["present"] / att_summary["total_days"] * 100, 1) if att_summary["total_days"] > 0 else 0
        
        # Tuition
        student_tuitions = [t for t in tuitions if t.student_id == student_id]
        tuition_summary = {
            "total_due": sum(t.amount_due for t in student_tuitions),
            "total_paid": sum(t.amount_paid for t in student_tuitions),
            "statuses": [t.status for t in student_tuitions],
            "risk_scores": [t.risk_score for t in student_tuitions if t.risk_score is not None],
        }
        
        # AI risk assessment
        risk_info = []
        for subject, subject_records in academics_summary_dict.items():
            scores = [r["score"] for r in subject_records]
            if len(scores) >= 3:
                analysis = analyze_grade_trend(scores, attendance_data=att_summary)
                if analysis["has_warning"]:
                    risk_info.append(f"{subject}: {analysis['risk_probability']:.0%} risk — {analysis['message']}")
        
        if student_tuitions:
            from ..ai_engine import predict_tuition_default
            balances = [t.amount_due for t in student_tuitions]
            payments = [t.amount_paid for t in student_tuitions]
            statuses = [t.status for t in student_tuitions]
            tuition_risk = predict_tuition_default(balances, payments, statuses)
            risk_info.append(f"Tuition default risk: {tuition_risk['risk_score']:.0%} — {tuition_risk['message']}")
        
        base_data.update({
            "student_name": f"{student.first_name} {student.last_name}",
            "student_grade": student.grade_level or "N/A",
            "student_section": student.section or "Unassigned",
            "enrollment_status": student.enrollment_status or "N/A",
            "student_academics": academics_summary_str,
            "student_attendance": f"Total: {att_summary['total_days']} days | Present: {att_summary['present']} | Absent: {att_summary['absent']} | Late: {att_summary['late']} | Rate: {att_rate}%",
            "student_tuition": f"Due: ₱{tuition_summary['total_due']:,.2f} | Paid: ₱{tuition_summary['total_paid']:,.2f} | Outstanding: ₱{tuition_summary['total_due'] - tuition_summary['total_paid']:,.2f}",
            "student_risk": "; ".join(risk_info) if risk_info else "No risk flags detected. Student appears to be in good standing.",
        })
    
    return base_data

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
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Auto-fill endpoint: returns existing student data for returning students."""
    student = check_duplicate_student(db, models.Student, first_name, last_name)
    if not student:
        return {"found": False}
        
    next_grade = student.grade_level
    if next_grade and next_grade.startswith("Grade "):
        try:
            num = int(next_grade.split()[1])
            if num < 10:
                next_grade = f"Grade {num + 1}"
            elif num == 10:
                next_grade = "Grade 11 (SHS)"
        except:
            pass
    elif next_grade == "Kinder":
        next_grade = "Grade 1"
    elif next_grade == "Pre-Kinder":
        next_grade = "Kinder"
        
    latest_form = db.query(models.EnrollmentForm).filter(
        models.EnrollmentForm.student_id == student.id
    ).order_by(models.EnrollmentForm.id.desc()).first()
    
    data = {
        "found": True,
        "student_id": student.id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "grade_level": next_grade,
        "section": student.section,
        "contact_email": student.contact_email,
        "school_year": student.school_year,
        "enrollment_status": student.enrollment_status,
    }
    
    if latest_form:
        data.update({
            "sex": latest_form.sex or '',
            "birth_date": latest_form.birth_date or '',
            "birth_place": latest_form.birth_place or '',
            "home_address": latest_form.home_address or '',
            "father_name": latest_form.father_name or '',
            "father_contact": latest_form.father_contact or '',
            "father_occupation": latest_form.father_occupation or '',
            "father_employer": latest_form.father_employer or '',
            "mother_name": latest_form.mother_name or '',
            "mother_contact": latest_form.mother_contact or '',
            "mother_occupation": latest_form.mother_occupation or '',
            "mother_employer": latest_form.mother_employer or '',
            "church_attended": latest_form.church_attended or '',
            "church_member": latest_form.church_member or '',
            "pastor_name": latest_form.pastor_name or '',
            "previous_school": latest_form.previous_school or '',
        })
        
    return data

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
    db.refresh(db_form)
    return db_form

@aesms_router.get("/enrollment_forms/my-forms", response_model=List[schemas.EnrollmentForm])
def get_my_forms(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Get all enrollment forms submitted by or for the current student user."""
    if current_user.role not in ["Student", "Parent"]:
        raise HTTPException(status_code=403, detail="Only students or parents can view their forms")
    if not current_user.student_id:
        return []
    return db.query(models.EnrollmentForm).filter(models.EnrollmentForm.student_id == current_user.student_id).order_by(models.EnrollmentForm.id.desc()).all()

@aesms_router.post("/enrollment_forms/student-submit", response_model=schemas.EnrollmentForm)
def student_submit_form(payload: schemas.PublicEnrollmentSubmit, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Submit an enrollment form for the currently logged in student."""
    if current_user.role not in ["Student", "Parent"]:
        raise HTTPException(status_code=403, detail="Only students or parents can submit via this endpoint")
    if not current_user.student_id:
        raise HTTPException(status_code=400, detail="User account is not linked to a student record")
    
    # Update student status to pre-registered if they were just pending
    student = db.query(models.Student).filter(models.Student.id == current_user.student_id).first()
    if student and student.enrollment_status == "Pending":
        student.enrollment_status = "Pre-Registered"
        
    db_form = models.EnrollmentForm(
        student_id=current_user.student_id,
        form_type="Online Enrollment",
        status="Needs Review",
        assessment_status="Pending",
        interview_status="Pending",
        **payload.model_dump()
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

    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = {".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"}
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type.")

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
def read_enrollment_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Registrar", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db.query(models.EnrollmentForm).order_by(models.EnrollmentForm.id.desc()).offset(skip).limit(limit).all()

@aesms_router.get("/enrollment_forms/check_duplicate")
def check_duplicate_form(student_id: int, form_type: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    existing = db.query(models.EnrollmentForm).filter(
        models.EnrollmentForm.student_id == student_id,
        models.EnrollmentForm.form_type == form_type
    ).first()
    return {"exists": existing is not None, "form_id": existing.id if existing else None}

@aesms_router.post("/enrollment_forms/public-preregister", response_model=schemas.EnrollmentForm)
def public_preregister(
    payload: schemas.PublicEnrollmentSubmit,
    db: Session = Depends(get_db)
):
    """Public pre-registration endpoint (no auth required)."""
    # Check if student already exists
    existing = check_duplicate_student(
        db, models.Student, payload.student_first_name, payload.student_last_name
    )
    if existing:
        student_id = existing.id
        existing.enrollment_status = "Pre-Registered"
    else:
        new_student = models.Student(
            first_name=payload.student_first_name.strip(),
            last_name=payload.student_last_name.strip(),
            grade_level=payload.grade_applying_for or "Pending",
            enrollment_status="Pre-Registered"
        )
        db.add(new_student)
        db.flush()
        student_id = new_student.id

    payload_data = payload.model_dump(exclude={"student_first_name", "student_last_name"})
    
    db_form = models.EnrollmentForm(
        student_id=student_id,
        form_type="Online Pre-Registration",
        status="Needs Review",
        assessment_status="Pending",
        interview_status="Pending",
        **payload_data
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@aesms_router.get("/enrollment_forms/check-status/{reference_id}", response_model=schemas.EnrollmentForm)
def check_preregister_status(reference_id: int, db: Session = Depends(get_db)):
    """Public endpoint to check enrollment status by form ID."""
    form = db.query(models.EnrollmentForm).filter(models.EnrollmentForm.id == reference_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Application not found")
    return form

@aesms_router.put("/enrollment_forms/{form_id}/assessment", response_model=schemas.EnrollmentForm)
def record_assessment(form_id: int, payload: schemas.AdmissionUpdatePayload, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    form = db.query(models.EnrollmentForm).filter(models.EnrollmentForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    form.assessment_status = payload.status
    if payload.remarks:
        form.assessment_remarks = payload.remarks
    form.assessed_by = current_user.id
    
    db.commit()
    db.refresh(form)
    return form

@aesms_router.put("/enrollment_forms/{form_id}/interview", response_model=schemas.EnrollmentForm)
def record_interview(form_id: int, payload: schemas.AdmissionUpdatePayload, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Admission"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    form = db.query(models.EnrollmentForm).filter(models.EnrollmentForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    form.interview_status = payload.status
    if payload.remarks:
        form.interview_remarks = payload.remarks
    form.interviewed_by = current_user.id
    
    db.commit()
    db.refresh(form)
    return form

@aesms_router.put("/enrollment_forms/{form_id}/verify", response_model=schemas.EnrollmentForm)
def verify_form(form_id: int, payload: schemas.EnrollmentFormVerify, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Registrar"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
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
        if payload.status == "Success":
            if form.assessment_status != "Passed" or form.interview_status != "Passed":
                raise HTTPException(status_code=400, detail="Cannot enroll student: Assessment and Interview must be Passed first.")
        
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
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif"}
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and GIF are allowed.")
    
    file_name = f"user_{user_id}_{int(time.time())}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_url = f"/uploads/{file_name}"
    db_user.profile_picture = file_url
    
    if db_user.student_id:
        student = db.query(models.Student).filter(models.Student.id == db_user.student_id).first()
        if student:
            student.profile_image = file_url
            
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

@aesms_router.post("/users/{user_id}/reset_password")
def reset_user_password(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Superadmin":
        raise HTTPException(status_code=403, detail="Only Superadmin can reset passwords")
        
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    default_pw = "cca2026"
    if db_user.student_id:
        student = db.query(models.Student).filter(models.Student.id == db_user.student_id).first()
        if student and student.last_name:
            default_pw = f"{student.last_name}cca2026".replace(" ", "").lower()
            
    db_user.hashed_password = get_password_hash(default_pw)
    db.commit()
    
    return {"message": "Password reset to default"}

@aesms_router.get("/debug/seed")
def debug_seed_db(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != "Superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        from seed_cca import seed_data
        seed_data()
        count = db.query(models.User).count()
        return {"status": "success", "users_count": count}
    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}

@aesms_router.get("/auth/section-schedule/{section}")
def get_section_schedule(section: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    teacher = db.query(models.User).filter(models.User.role == "Teacher", models.User.section == section).first()
    if teacher and teacher.schedule:
        return {"schedule": teacher.schedule, "teacher_name": teacher.full_name}
    return {"schedule": "[]", "teacher_name": None}

@aesms_router.post("/admin/end_school_year")
def end_school_year(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Principal", "Registrar"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    students = db.query(models.Student).filter(models.Student.enrollment_status == "Enrolled").all()
    promoted_count = 0
    for student in students:
        # Increment school year
        if student.school_year:
            parts = student.school_year.split('-')
            if len(parts) == 2:
                try:
                    student.school_year = f"{int(parts[0])+1}-{int(parts[1])+1}"
                except:
                    pass
        
        # Advance grade level
        grade = student.grade_level
        if grade and "Grade" in grade:
            try:
                num = int(grade.split()[1])
                if num < 12:
                    student.grade_level = f"Grade {num+1}"
            except:
                pass
                
        # Clear section so they need to be re-assigned next year
        student.section = None
        student.enrollment_status = "Pending Validation"
        promoted_count += 1
        
    db.commit()
    return {"detail": f"School year ended. {promoted_count} students moved to next grade and archived."}


# ---------------------------------------------------------------------------
# Announcements
# ---------------------------------------------------------------------------

@aesms_router.get("/announcements/", response_model=List[schemas.Announcement])
def list_announcements(limit: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    query = db.query(models.Announcement)
    if current_user.role in ["Student", "Parent"]:
        if current_user.student_id:
            student = db.query(models.Student).filter(models.Student.id == current_user.student_id).first()
            section = student.section if student else None
            query = query.filter((models.Announcement.target_section == None) | (models.Announcement.target_section == "") | (models.Announcement.target_section == section))
        else:
            query = query.filter((models.Announcement.target_section == None) | (models.Announcement.target_section == ""))
    elif current_user.role == "Teacher":
        query = query.filter((models.Announcement.target_section == None) | (models.Announcement.target_section == "") | (models.Announcement.target_section == current_user.section))
    return query.order_by(models.Announcement.id.desc()).limit(limit).all()

@aesms_router.post("/announcements/", response_model=schemas.Announcement)
def create_announcement(payload: schemas.AnnouncementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Superadmin", "Principal", "Registrar", "Admission", "Teacher"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_ann = models.Announcement(
        title=payload.title,
        content=payload.content,
        is_pinned=payload.is_pinned,
        author_id=current_user.id,
        author_role=current_user.role,
        created_at=datetime.now().isoformat(),
        target_section=payload.target_section
    )
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    return db_ann

@aesms_router.delete("/announcements/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Superadmin", "Principal"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    return {"detail": "Announcement deleted"}


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------

@aesms_router.get("/events/", response_model=List[schemas.Event])
def list_events(limit: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    today = date.today().isoformat()
    query = db.query(models.Event).filter(models.Event.event_date >= today)
    if current_user.role in ["Student", "Parent"]:
        if current_user.student_id:
            student = db.query(models.Student).filter(models.Student.id == current_user.student_id).first()
            section = student.section if student else None
            query = query.filter((models.Event.target_section == None) | (models.Event.target_section == "") | (models.Event.target_section == section))
        else:
            query = query.filter((models.Event.target_section == None) | (models.Event.target_section == ""))
    elif current_user.role == "Teacher":
        query = query.filter((models.Event.target_section == None) | (models.Event.target_section == "") | (models.Event.target_section == current_user.section))
    return query.order_by(models.Event.event_date.asc()).limit(limit).all()

@aesms_router.get("/events/all", response_model=List[schemas.Event])
def list_all_events(limit: int = 50, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    query = db.query(models.Event)
    if current_user.role in ["Student", "Parent"]:
        if current_user.student_id:
            student = db.query(models.Student).filter(models.Student.id == current_user.student_id).first()
            section = student.section if student else None
            query = query.filter((models.Event.target_section == None) | (models.Event.target_section == "") | (models.Event.target_section == section))
        else:
            query = query.filter((models.Event.target_section == None) | (models.Event.target_section == ""))
    elif current_user.role == "Teacher":
        query = query.filter((models.Event.target_section == None) | (models.Event.target_section == "") | (models.Event.target_section == current_user.section))
    return query.order_by(models.Event.event_date.desc()).limit(limit).all()

@aesms_router.post("/events/", response_model=schemas.Event)
def create_event(payload: schemas.EventCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Superadmin", "Principal", "Registrar", "Admission", "Teacher"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_event = models.Event(
        title=payload.title,
        description=payload.description,
        event_date=payload.event_date,
        event_time=payload.event_time,
        location=payload.location,
        created_by=current_user.id,
        target_section=payload.target_section
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@aesms_router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in ["Superadmin", "Principal"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"detail": "Event deleted"}


# ---------------------------------------------------------------------------
# Dashboard Widgets (AI Insights, Enrollment Trends, Student Population)
# ---------------------------------------------------------------------------

@aesms_router.get("/dashboard/widgets")
def get_dashboard_widgets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Returns comprehensive dashboard widget data including Gemini AI insights."""

    students = db.query(models.Student).all()
    tuitions = db.query(models.TuitionPayment).all()
    records = db.query(models.AcademicRecord).all()
    all_attendance = db.query(models.Attendance).all()

    total_students = len(students)
    enrolled_students = len([s for s in students if s.enrollment_status == "Enrolled"])
    pending_students = len([s for s in students if s.enrollment_status in ["Pending", "Pending Validation", "Hold: Incomplete Req"]])

    # Attendance stats
    total_att_records = len(all_attendance)
    present_count = len([a for a in all_attendance if a.status == "Present"])
    absence_count = len([a for a in all_attendance if a.status == "Absent"])
    late_count = len([a for a in all_attendance if a.status == "Late"])
    attendance_rate = round(present_count / total_att_records * 100, 1) if total_att_records > 0 else 0

    # Revenue stats
    total_due = sum(t.amount_due for t in tuitions)
    total_paid = sum(t.amount_paid for t in tuitions)
    outstanding = total_due - total_paid
    high_risk = len([t for t in tuitions if t.risk_score and t.risk_score >= 0.8])

    # Academic stats
    academic_avg = round(sum(r.score for r in records) / len(records), 1) if records else 0

    # Warning count
    warning_count = 0
    for student in students:
        student_records = [r for r in records if r.student_id == student.id]
        subjects = set(r.subject for r in student_records)
        for subject in subjects:
            scores = [r.score for r in student_records if r.subject == subject]
            if len(scores) >= 3:
                analysis = analyze_grade_trend(scores)
                if analysis["has_warning"]:
                    warning_count += 1
                    break

    # Grade distribution
    grade_dist = {}
    for s in students:
        gl = s.grade_level or "Unknown"
        grade_dist[gl] = grade_dist.get(gl, 0) + 1

    # Enrollment trends (by month — based on enrollment form creation)
    enrollment_forms = db.query(models.EnrollmentForm).all()
    # Group by month using form IDs as proxy for chronological order
    monthly_enrollments = {}
    months_order = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    for m in months_order:
        monthly_enrollments[m] = 0
    # Count enrolled students per grade as a simple trend proxy
    for s in students:
        if s.enrollment_status == "Enrolled":
            # Distribute across recent months for visualization
            idx = s.id % 12
            monthly_enrollments[months_order[idx]] += 1

    # --- Gemini AI Insights ---
    school_data = {
        "total_students": total_students,
        "enrolled_students": enrolled_students,
        "pending_students": pending_students,
        "attendance_rate": attendance_rate,
        "absence_count": absence_count,
        "late_count": late_count,
        "total_revenue_due": total_due,
        "total_revenue_collected": total_paid,
        "outstanding_balance": outstanding,
        "academic_average": academic_avg,
        "warning_count": warning_count,
        "grade_distribution": grade_dist,
        "high_risk_tuition": high_risk,
    }

    ai_insights = generate_dashboard_insights(school_data)

    return {
        "ai_insights": ai_insights,
        "student_population": grade_dist,
        "enrollment_trends": monthly_enrollments,
        "stats": {
            "total_students": total_students,
            "enrolled_students": enrolled_students,
            "pending_students": pending_students,
            "attendance_rate": attendance_rate,
            "total_revenue_due": total_due,
            "total_revenue_collected": total_paid,
            "outstanding_balance": outstanding,
            "academic_average": academic_avg,
            "warning_count": warning_count,
            "high_risk_tuition": high_risk,
        }
    }


# ---------------------------------------------------------------------------
# Student Self-Enrollment (for Student/Parent roles)
# ---------------------------------------------------------------------------

@aesms_router.post("/enrollment_forms/student-submit", response_model=schemas.EnrollmentForm)
def student_submit_enrollment(
    payload: schemas.StudentEnrollmentSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Allows Student/Parent to submit an enrollment form for Admission review."""
    if current_user.role not in ["Student", "Parent"]:
        raise HTTPException(status_code=403, detail="Only students and parents can submit enrollment forms")

    # Check if there's already a pending form
    if current_user.student_id:
        existing_pending = db.query(models.EnrollmentForm).filter(
            models.EnrollmentForm.student_id == current_user.student_id,
            models.EnrollmentForm.status.in_(["Needs Review", "Hold"])
        ).first()
        if existing_pending:
            raise HTTPException(
                status_code=400,
                detail="You already have a pending enrollment form. Please wait for it to be reviewed."
            )

    # Link to existing student record or use the name
    student_id = current_user.student_id

    if not student_id:
        # Check if student record exists by name
        existing = check_duplicate_student(
            db, models.Student, payload.student_first_name, payload.student_last_name
        )
        if existing:
            student_id = existing.id
        else:
            # Create new student record
            new_student = models.Student(
                first_name=payload.student_first_name.strip(),
                last_name=payload.student_last_name.strip(),
                grade_level=payload.grade_applying_for or "Pending",
                contact_email=payload.contact_email,
                enrollment_status="Pending Validation"
            )
            db.add(new_student)
            db.flush()
            student_id = new_student.id

    db_form = models.EnrollmentForm(
        student_id=student_id,
        form_type="Online Pre-Registration",
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

@aesms_router.get("/enrollment_forms/my-forms", response_model=List[schemas.EnrollmentForm])
def get_my_enrollment_forms(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Returns enrollment forms submitted by or linked to the current student."""
    if current_user.student_id:
        return db.query(models.EnrollmentForm).filter(
            models.EnrollmentForm.student_id == current_user.student_id
        ).order_by(models.EnrollmentForm.id.desc()).all()
    return db.query(models.EnrollmentForm).filter(
        models.EnrollmentForm.submitted_by == current_user.id
    ).order_by(models.EnrollmentForm.id.desc()).all()


# ---------------------------------------------------------------------------
# School Config
# ---------------------------------------------------------------------------
from ..school_config import get_school_config, SECTIONS, SUBJECTS

@aesms_router.get("/school/config")
def read_school_config(db: Session = Depends(get_db)):
    """Returns the static school configuration for sections and subjects."""
    return get_school_config()

@aesms_router.get("/school/sections")
def read_school_sections(db: Session = Depends(get_db)):
    """Returns sections with their current enrollment counts."""
    # Count students per section
    section_counts = dict(db.query(models.Student.section, func.count(models.Student.id)).group_by(models.Student.section).all())
    
    sections_with_counts = {}
    for grade, section_data in SECTIONS.items():
        name = section_data["name"]
        sections_with_counts[name] = {
            "grade": grade,
            "max_students": section_data["max_students"],
            "current_enrolled": section_counts.get(name, 0)
        }
    return sections_with_counts

@aesms_router.get("/school/subjects/{grade_level}")
def read_school_subjects(grade_level: str, db: Session = Depends(get_db)):
    """Returns the curriculum subjects for a specific grade level."""
    return SUBJECTS.get(grade_level, [])

# ---------------------------------------------------------------------------
# Fees & Payments
# ---------------------------------------------------------------------------
from ..fee_structure import FEE_STRUCTURE, compute_total_fees

@aesms_router.get("/fees/structure")
def read_fee_structure():
    """Returns the static school fee structure."""
    return FEE_STRUCTURE

@aesms_router.post("/fees/compute/{student_id}")
def compute_student_fees(student_id: int, include_books: bool = False, full_payment: bool = False, db: Session = Depends(get_db)):
    """Computes the total fees for a specific student."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    return compute_total_fees(student.grade_level, student.membership_type, include_books, full_payment)

@aesms_router.get("/payments/student/{student_id}/breakdown")
def get_payment_breakdown(student_id: int, db: Session = Depends(get_db)):
    """Returns detailed payment breakdown for a student."""
    tuition = db.query(models.TuitionPayment).filter(models.TuitionPayment.student_id == student_id).first()
    if not tuition:
        raise HTTPException(status_code=404, detail="Tuition record not found")
    return tuition

@aesms_router.get("/payments/summary")
def get_payment_summary(db: Session = Depends(get_db)):
    """Returns school-wide payment collection summary."""
    total_due = db.query(func.sum(models.TuitionPayment.amount_due)).scalar() or 0
    total_paid = db.query(func.sum(models.TuitionPayment.amount_paid)).scalar() or 0
    return {
        "total_due": total_due,
        "total_paid": total_paid,
        "collection_rate": (total_paid / total_due) * 100 if total_due > 0 else 0
    }

# ---------------------------------------------------------------------------
# Digitalized Forms
# ---------------------------------------------------------------------------
from ..forms import FORM_TEMPLATES, generate_form_html
from fastapi.responses import HTMLResponse

@aesms_router.get("/forms/templates")
def read_form_templates():
    """Returns available digital form templates."""
    return FORM_TEMPLATES

@aesms_router.get("/forms/{form_type}/student/{student_id}", response_class=HTMLResponse)
def get_student_form(form_type: str, student_id: int, db: Session = Depends(get_db)):
    """Generates a filled HTML form for a specific student."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_data = {
        "first_name": student.first_name,
        "last_name": student.last_name,
        "grade_level": student.grade_level,
        "section": student.section,
        "contact_email": student.contact_email,
        "enrollment_status": student.enrollment_status,
        "school_year": student.school_year,
        "req_birth_cert": student.req_birth_cert,
        "req_form_138": student.req_form_138,
        "req_good_moral": student.req_good_moral,
        "req_pictures": student.req_pictures,
    }
    
    return generate_form_html(form_type, student_data)

@aesms_router.get("/forms/{form_type}/blank", response_class=HTMLResponse)
def get_blank_form(form_type: str):
    """Generates a blank HTML form template."""
    return generate_form_html(form_type, {})

# ---------------------------------------------------------------------------
# Student Clearance
# ---------------------------------------------------------------------------
@aesms_router.get("/clearances/", response_model=List[schemas.StudentClearance])
def get_all_clearances(db: Session = Depends(get_db)):
    """Get all clearance records."""
    return db.query(models.StudentClearance).all()

@aesms_router.get("/clearances/student/{student_id}", response_model=List[schemas.StudentClearance])
def get_student_clearance(student_id: int, db: Session = Depends(get_db)):
    """Get all clearance records for a student."""
    return db.query(models.StudentClearance).filter(models.StudentClearance.student_id == student_id).all()

@aesms_router.post("/clearances/", response_model=schemas.StudentClearance)
def create_student_clearance(clearance: schemas.StudentClearanceCreate, db: Session = Depends(get_db)):
    """Create a new clearance record for a student."""
    db_clearance = models.StudentClearance(**clearance.model_dump())
    db.add(db_clearance)
    db.commit()
    db.refresh(db_clearance)
    
    # Auto-generate items for standard departments in sequence
    departments = ["Subjects", "Library", "Clinic", "Cashier", "Principal", "Registrar"]
    for dept in departments:
        item = models.ClearanceItem(
            clearance_id=db_clearance.id,
            department=dept,
            status="Pending"
        )
        db.add(item)
    db.commit()
    db.refresh(db_clearance)
    
    return db_clearance

@aesms_router.put("/clearances/items/{item_id}", response_model=schemas.ClearanceItem)
def update_clearance_item(item_id: int, payload: schemas.ClearanceItemBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Update a specific clearance item (e.g. mark as Cleared by Cashier). Enforces sequence."""
    item = db.query(models.ClearanceItem).filter(models.ClearanceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clearance item not found")
        
    if payload.status == "Cleared":
        # Check sequence
        clearance = db.query(models.StudentClearance).filter(models.StudentClearance.id == item.clearance_id).first()
        departments_order = ["Subjects", "Library", "Clinic", "Cashier", "Principal", "Registrar"]
        try:
            dept_index = departments_order.index(item.department)
        except ValueError:
            dept_index = -1
            
        if dept_index > 0:
            prev_dept = departments_order[dept_index - 1]
            prev_item = next((i for i in clearance.items if i.department == prev_dept), None)
            if prev_item and prev_item.status != "Cleared":
                raise HTTPException(status_code=400, detail=f"Cannot clear {item.department}. {prev_dept} must be cleared first.")
        
    item.status = payload.status
    item.remarks = payload.remarks
    item.cleared_by = current_user.id if payload.status == "Cleared" else None
    item.date_cleared = datetime.now().isoformat() if payload.status == "Cleared" else None
    
    db.commit()
    db.refresh(item)
    
    # Check if all items are cleared to update the main clearance status
    clearance = db.query(models.StudentClearance).filter(models.StudentClearance.id == item.clearance_id).first()
    all_cleared = all(i.status == "Cleared" for i in clearance.items)
    if all_cleared:
        clearance.status = "Cleared"
    else:
        clearance.status = "Pending"
    db.commit()
    
    return item

# ---------------------------------------------------------------------------
# Report Generation
# ---------------------------------------------------------------------------
from ..report_templates import get_enrollment_report, get_financial_report, get_clearance_report

@aesms_router.get("/reports/enrollment")
def read_enrollment_report(school_year: str = "2026-2027", db: Session = Depends(get_db)):
    """Generates an enrollment summary report."""
    return get_enrollment_report(db, school_year)

@aesms_router.get("/reports/financial")
def read_financial_report(db: Session = Depends(get_db)):
    """Generates a financial collection summary report."""
    return get_financial_report(db)

@aesms_router.get("/reports/clearance")
def read_clearance_report(school_year: str = "2026-2027", db: Session = Depends(get_db)):
    """Generates a student clearance status report."""
    return get_clearance_report(db, school_year)

# ---------------------------------------------------------------------------
# AI Assistant (Chat)
# ---------------------------------------------------------------------------
from ..ai_assistant import chat_with_assistant
from pydantic import BaseModel

class ChatMessage(BaseModel):
    message: str

@aesms_router.post("/ai/chat")
def ai_chat(payload: ChatMessage, current_user: models.User = Depends(get_current_active_user)):
    """Endpoint for the floating AI assistant widget."""
    response = chat_with_assistant(payload.message, current_user.role)
    return {"response": response}


# ---------------------------------------------------------------------------
# Document Requests (V2.2)
# ---------------------------------------------------------------------------

@aesms_router.get("/document-requests/")
def list_document_requests(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """List document requests. Registrar/Principal see all, students see their own."""
    if current_user.role in ["Principal", "Registrar", "Superadmin"]:
        reqs = db.query(models.DocumentRequest).all()
    elif current_user.role in ["Student", "Parent"]:
        reqs = db.query(models.DocumentRequest).filter(models.DocumentRequest.student_id == current_user.student_id).all()
    else:
        reqs = []
    # Enrich with student name
    results = []
    for r in reqs:
        student = db.query(models.Student).filter(models.Student.id == r.student_id).first()
        results.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": f"{student.last_name}, {student.first_name}" if student else "Unknown",
            "student_grade": student.grade_level if student else "",
            "document_type": r.document_type,
            "status": r.status,
            "date_requested": r.date_requested,
            "date_processed": r.date_processed,
            "processed_by": r.processed_by,
            "remarks": r.remarks,
        })
    return results

@aesms_router.post("/document-requests/")
def create_document_request(payload: schemas.DocumentRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Create a new document request."""
    new_req = models.DocumentRequest(
        student_id=payload.student_id,
        document_type=payload.document_type,
        remarks=payload.remarks,
        date_requested=datetime.now().isoformat(),
        status="Pending",
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    # Log history
    history = models.StudentHistory(
        student_id=payload.student_id,
        action="Document Request",
        description=f"Requested {payload.document_type}",
        date_recorded=datetime.now().isoformat(),
        recorded_by=current_user.id,
    )
    db.add(history)
    db.commit()
    return new_req

@aesms_router.put("/document-requests/{request_id}")
def update_document_request(request_id: int, payload: schemas.DocumentRequestUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Update a document request status (Registrar/Principal only)."""
    if current_user.role not in ["Principal", "Registrar", "Superadmin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    req = db.query(models.DocumentRequest).filter(models.DocumentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if payload.status:
        req.status = payload.status
    if payload.remarks is not None:
        req.remarks = payload.remarks
    if payload.status in ["Ready", "Released", "Rejected"]:
        req.date_processed = datetime.now().isoformat()
        req.processed_by = current_user.id
    db.commit()
    db.refresh(req)
    # Log history
    history = models.StudentHistory(
        student_id=req.student_id,
        action="Document Request Updated",
        description=f"{req.document_type} marked as {req.status}",
        date_recorded=datetime.now().isoformat(),
        recorded_by=current_user.id,
    )
    db.add(history)
    db.commit()
    return req


# ---------------------------------------------------------------------------
# Student History / Action Log (V2.2)
# ---------------------------------------------------------------------------

@aesms_router.get("/student-history/{student_id}")
def get_student_history(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Get history of actions for a student."""
    history = db.query(models.StudentHistory).filter(models.StudentHistory.student_id == student_id).order_by(models.StudentHistory.id.desc()).all()
    results = []
    for h in history:
        recorder = db.query(models.User).filter(models.User.id == h.recorded_by).first() if h.recorded_by else None
        results.append({
            "id": h.id,
            "student_id": h.student_id,
            "action": h.action,
            "description": h.description,
            "date_recorded": h.date_recorded,
            "recorded_by": h.recorded_by,
            "recorder_name": recorder.username if recorder else None,
        })
    return results

@aesms_router.post("/student-history/")
def create_student_history(payload: schemas.StudentHistoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Create a manual history entry."""
    entry = models.StudentHistory(
        student_id=payload.student_id,
        action=payload.action,
        description=payload.description,
        date_recorded=datetime.now().isoformat(),
        recorded_by=current_user.id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# ---------------------------------------------------------------------------
# Password Validation (V2.2 - Section 5.10)
# ---------------------------------------------------------------------------

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

@aesms_router.post("/auth/change-password")
def change_password(payload: PasswordChangeRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Change password with strength validation."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_pw = payload.new_password
    # Enforce password strength
    errors = []
    if len(new_pw) < 8:
        errors.append("Password must be at least 8 characters long")
    if not any(c.isupper() for c in new_pw):
        errors.append("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in new_pw):
        errors.append("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in new_pw):
        errors.append("Password must contain at least one number")
    if not any(c in "!@#$%^&*()_+-=[]{}|;:',.<>?/~`" for c in new_pw):
        errors.append("Password must contain at least one special character")
    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))
    
    current_user.hashed_password = get_password_hash(new_pw)
    db.commit()
    
    # Log history if linked to a student
    if current_user.student_id:
        history = models.StudentHistory(
            student_id=current_user.student_id,
            action="Password Changed",
            description="Password was changed by user",
            date_recorded=datetime.now().isoformat(),
            recorded_by=current_user.id,
        )
        db.add(history)
        db.commit()
    
    return {"message": "Password changed successfully"}


# ---------------------------------------------------------------------------
# Registrar Dashboard Stats (V2.2 - Section 5.3)
# ---------------------------------------------------------------------------

@aesms_router.get("/registrar/dashboard-stats")
def registrar_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    """Get dashboard stats specifically for the Registrar."""
    all_students = db.query(models.Student).filter(models.Student.is_archived == 0).all()
    
    # Count old vs new students (based on enrollment forms/pre-registration)
    enrolled_forms = db.query(models.EnrollmentForm).all()
    new_student_ids = set(f.student_id for f in enrolled_forms if f.student_id)
    
    old_students = [s for s in all_students if s.id not in new_student_ids]
    new_students = [s for s in all_students if s.id in new_student_ids]
    
    # Incomplete requirements
    incomplete = [s for s in all_students if not (s.req_birth_cert and s.req_form_138 and s.req_good_moral and s.req_pictures)]
    
    # Document requests
    pending_requests = db.query(models.DocumentRequest).filter(models.DocumentRequest.status == "Pending").count()
    
    return {
        "total_students": len(all_students),
        "old_students": len(old_students),
        "new_students": len(new_students),
        "incomplete_requirements": len(incomplete),
        "pending_document_requests": pending_requests,
    }

