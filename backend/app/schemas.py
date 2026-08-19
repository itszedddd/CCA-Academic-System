from pydantic import BaseModel
from typing import List, Optional


# ---------------------------------------------------------------------------
# Academic Records
# ---------------------------------------------------------------------------
class AcademicRecordBase(BaseModel):
    subject: str
    score: float
    term: str
    school_year: Optional[str] = None

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
    account_username: Optional[str] = None
    initial_password: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    academic_records: List[AcademicRecord] = []
    tuition_payments: List['TuitionPayment'] = []

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

class PaymentScheduleBase(BaseModel):
    due_date: str
    amount_due: float
    amount_paid: float = 0.0
    status: Optional[str] = "Pending"

class PaymentScheduleCreate(PaymentScheduleBase):
    tuition_id: int

class PaymentSchedule(PaymentScheduleBase):
    id: int
    tuition_id: int

    class Config:
        from_attributes = True

class TuitionPaymentBase(BaseModel):
    student_id: int
    
    # Detailed Fee Breakdown
    reg_fee: float = 0.0
    tuition_fee: float = 0.0
    energy_fee: float = 0.0
    books_fee: float = 0.0
    esc_subsidy: float = 0.0
    discount: float = 0.0
    
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
    schedules: List[PaymentSchedule] = []

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Student Clearance
# ---------------------------------------------------------------------------
class ClearanceItemBase(BaseModel):
    department: str
    status: Optional[str] = "Pending"
    remarks: Optional[str] = None
    cleared_by: Optional[int] = None
    date_cleared: Optional[str] = None

class ClearanceItemCreate(ClearanceItemBase):
    clearance_id: int

class ClearanceItem(ClearanceItemBase):
    id: int
    clearance_id: int

    class Config:
        from_attributes = True

class StudentClearanceBase(BaseModel):
    student_id: int
    school_year: str
    term: str
    status: Optional[str] = "Pending"

class StudentClearanceCreate(StudentClearanceBase):
    pass

class StudentClearance(StudentClearanceBase):
    id: int
    items: List[ClearanceItem] = []
    student: Optional[StudentBase] = None

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Enrollment Forms (Structured Digital Form)
# ---------------------------------------------------------------------------
class EnrollmentFormBase(BaseModel):
    student_id: Optional[int] = None
    form_type: str
    status: Optional[str] = "Needs Review"

    # Admission Pipeline
    assessment_status: Optional[str] = "Pending"
    interview_status: Optional[str] = "Pending"
    assessment_remarks: Optional[str] = None
    interview_remarks: Optional[str] = None
    assessed_by: Optional[int] = None
    interviewed_by: Optional[int] = None

    # Structured student data
    sex: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    home_address: Optional[str] = None
    father_name: Optional[str] = None
    father_contact: Optional[str] = None
    father_occupation: Optional[str] = None
    father_employer: Optional[str] = None
    mother_name: Optional[str] = None
    mother_contact: Optional[str] = None
    mother_occupation: Optional[str] = None
    mother_employer: Optional[str] = None
    church_attended: Optional[str] = None
    church_member: Optional[str] = None
    pastor_name: Optional[str] = None
    previous_school: Optional[str] = None
    grade_applying_for: Optional[str] = None
    repeated_grade: Optional[str] = None
    expelled_dismissed: Optional[str] = None
    learning_disabilities: Optional[str] = None
    special_talents: Optional[str] = None
    how_heard: Optional[str] = None
    reason_selecting: Optional[str] = None
    
    # New Fields (V2.0 Major Inspection Report)
    middle_name: Optional[str] = None
    contact_number: Optional[str] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    physician_name: Optional[str] = None
    physician_contact: Optional[str] = None
    waiver_agreed: Optional[bool] = None
    consent_agreed: Optional[bool] = None
    
    # Document Requirements checklist
    req_birth_cert: Optional[int] = 0
    req_form_138: Optional[int] = 0
    req_good_moral: Optional[int] = 0
    req_pictures: Optional[int] = 0

    # Legacy / attachment fields
    file_path: Optional[str] = None
    extracted_text: Optional[str] = None
    remarks: Optional[str] = None
    submitted_by: Optional[int] = None

class EnrollmentFormCreate(BaseModel):
    """Schema for creating a new enrollment form via structured digital input."""
    student_first_name: str
    student_last_name: str
    form_type: str = "Pre-Registration Application"
    grade_applying_for: Optional[str] = None

    # Student info
    sex: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    home_address: Optional[str] = None

    # Family info
    father_name: Optional[str] = None
    father_contact: Optional[str] = None
    father_occupation: Optional[str] = None
    father_employer: Optional[str] = None
    mother_name: Optional[str] = None
    mother_contact: Optional[str] = None
    mother_occupation: Optional[str] = None
    mother_employer: Optional[str] = None

    # Church info
    church_attended: Optional[str] = None
    church_member: Optional[str] = None
    pastor_name: Optional[str] = None

    # Academic history
    previous_school: Optional[str] = None
    repeated_grade: Optional[str] = None
    expelled_dismissed: Optional[str] = None
    learning_disabilities: Optional[str] = None
    special_talents: Optional[str] = None

    # General
    how_heard: Optional[str] = None
    reason_selecting: Optional[str] = None
    
    # Document Requirements checklist
    req_birth_cert: Optional[int] = 0
    req_form_138: Optional[int] = 0
    req_good_moral: Optional[int] = 0
    req_pictures: Optional[int] = 0

class AdmissionUpdatePayload(BaseModel):
    status: str
    remarks: Optional[str] = None

class PublicEnrollmentSubmit(BaseModel):
    """Schema for the public pre-registration form."""
    student_first_name: str
    student_last_name: str
    grade_applying_for: Optional[str] = None
    sex: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    home_address: Optional[str] = None
    father_name: Optional[str] = None
    father_contact: Optional[str] = None
    father_occupation: Optional[str] = None
    father_employer: Optional[str] = None
    mother_name: Optional[str] = None
    mother_contact: Optional[str] = None
    mother_occupation: Optional[str] = None
    mother_employer: Optional[str] = None
    church_attended: Optional[str] = None
    church_member: Optional[str] = None
    pastor_name: Optional[str] = None
    previous_school: Optional[str] = None
    repeated_grade: Optional[str] = None
    expelled_dismissed: Optional[str] = None
    learning_disabilities: Optional[str] = None
    special_talents: Optional[str] = None
    how_heard: Optional[str] = None
    reason_selecting: Optional[str] = None

    # New Fields (V2.0 Major Inspection Report)
    middle_name: Optional[str] = None
    contact_number: Optional[str] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    physician_name: Optional[str] = None
    physician_contact: Optional[str] = None
    waiver_agreed: Optional[bool] = None
    consent_agreed: Optional[bool] = None

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

class EnrollmentForm(EnrollmentFormBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Users & Auth
# ---------------------------------------------------------------------------
class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str           # Administrator, Teacher, Parent, Student
    student_id: Optional[int] = None
    is_active: Optional[int] = 1
    section: Optional[str] = None  # Assigned section for Teacher role
    profile_picture: Optional[str] = None
    schedule: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Announcements
# ---------------------------------------------------------------------------
class AnnouncementBase(BaseModel):
    title: str
    content: str
    is_pinned: Optional[int] = 0
    target_section: Optional[str] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class Announcement(AnnouncementBase):
    id: int
    author_id: Optional[int] = None
    author_role: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    location: Optional[str] = None
    target_section: Optional[str] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Student Self-Enrollment (submitted by Student/Parent roles)
# ---------------------------------------------------------------------------
class StudentEnrollmentSubmit(BaseModel):
    """Schema for students/parents to submit their own enrollment form."""
    student_first_name: str
    student_last_name: str
    grade_applying_for: Optional[str] = None

    # Student info
    sex: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    home_address: Optional[str] = None
    contact_email: Optional[str] = None

    # Family info
    father_name: Optional[str] = None
    father_contact: Optional[str] = None
    father_occupation: Optional[str] = None
    father_employer: Optional[str] = None
    mother_name: Optional[str] = None
    mother_contact: Optional[str] = None
    mother_occupation: Optional[str] = None
    mother_employer: Optional[str] = None

    # Church info
    church_attended: Optional[str] = None
    church_member: Optional[str] = None
    pastor_name: Optional[str] = None

    # Academic history
    previous_school: Optional[str] = None
    repeated_grade: Optional[str] = None
    expelled_dismissed: Optional[str] = None
    learning_disabilities: Optional[str] = None
    special_talents: Optional[str] = None

    # General
    how_heard: Optional[str] = None
    reason_selecting: Optional[str] = None

