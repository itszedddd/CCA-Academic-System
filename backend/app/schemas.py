from pydantic import BaseModel
from typing import List, Optional


# ---------------------------------------------------------------------------
# Academic Records
# ---------------------------------------------------------------------------
class AcademicRecordBase(BaseModel):
    subject: str
    score: float
    term: str

class AcademicRecordCreate(AcademicRecordBase):
    student_id: int

class AcademicRecord(AcademicRecordBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    grade_level: str
    school_year: Optional[str] = "2025-2026"
    section: Optional[str] = None
    contact_email: Optional[str] = None
    profile_image: Optional[str] = None
    enrollment_status: Optional[str] = "Pending"
    req_birth_cert: Optional[int] = 0
    req_form_138: Optional[int] = 0
    req_good_moral: Optional[int] = 0
    req_pictures: Optional[int] = 0

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    academic_records: List[AcademicRecord] = []

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Attendance
# ---------------------------------------------------------------------------
class AttendanceBase(BaseModel):
    student_id: int
    date: str          # ISO date string e.g. "2026-03-22"
    status: str        # Present, Absent, Late
    remarks: Optional[str] = None
    recorded_by: Optional[int] = None

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Tuition Payments & History
# ---------------------------------------------------------------------------
class PaymentRecordBase(BaseModel):
    amount: float
    or_number: str
    date_recorded: str
    recorded_by: Optional[int] = None

class PaymentRecordCreate(PaymentRecordBase):
    pass

class PaymentRecord(PaymentRecordBase):
    id: int
    tuition_id: int

    class Config:
        from_attributes = True

class TuitionPaymentBase(BaseModel):
    student_id: int
    amount_due: float
    amount_paid: float
    term: str
    status: Optional[str] = "Pending"
    risk_score: Optional[float] = None

class TuitionPaymentCreate(TuitionPaymentBase):
    pass

class TuitionPayment(TuitionPaymentBase):
    id: int
    payments: List[PaymentRecord] = []

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Enrollment Forms (OCR)
# ---------------------------------------------------------------------------
class EnrollmentFormBase(BaseModel):
    student_id: Optional[int] = None
    form_type: str
    file_path: str
    extracted_text: Optional[str] = None
    status: Optional[str] = "Processing"
    remarks: Optional[str] = None

class EnrollmentFormVerify(BaseModel):
    status: str
    remarks: Optional[str] = None
    student_first_name: Optional[str] = None
    student_last_name: Optional[str] = None
    student_dob: Optional[str] = None
    req_birth_cert: Optional[int] = 0
    req_form_138: Optional[int] = 0
    req_good_moral: Optional[int] = 0
    req_pictures: Optional[int] = 0

class EnrollmentFormCreate(EnrollmentFormBase):
    pass

class EnrollmentForm(EnrollmentFormBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Users & Auth
# ---------------------------------------------------------------------------
class UserBase(BaseModel):
    username: str
    role: str           # Administrator, Teacher, Parent, Student
    student_id: Optional[int] = None
    is_active: Optional[int] = 1
    section: Optional[str] = None  # Assigned section for Teacher role

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Resource Recommendation (response-only schema)
# ---------------------------------------------------------------------------
class ResourceRecommendation(BaseModel):
    subject: str
    average_score: float
    resource_title: str
    resource_url: str
    resource_type: str   # Video, Article, Practice Set
