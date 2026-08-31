from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    grade_level = Column(String)
    school_year = Column(String, default="2025-2026")
    section = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)    # Parent/Guardian email
    profile_image = Column(String, nullable=True)    # External URL mapping
    enrollment_status = Column(String, default="Pending")  # Enrolled, Pending, Dropped, Hold: Incomplete Req
    membership_type = Column(String, default="Non-Member") # CBC Member, Non-Member
    is_archived = Column(Integer, default=0) # 0 for false, 1 for true
    
    # Detailed personal information transferred from EnrollmentForm
    gender = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    address = Column(String, nullable=True)
    parent_name = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)

    # Admission Checklist Requirements
    req_birth_cert = Column(Integer, default=0)
    req_form_138 = Column(Integer, default=0)
    req_good_moral = Column(Integer, default=0)
    req_pictures = Column(Integer, default=0)

    # Auto-generated Account Details (for teacher to notify student)
    account_username = Column(String, nullable=True)
    initial_password = Column(String, nullable=True)

    academic_records = relationship("AcademicRecord", back_populates="student")
    attendance_records = relationship("Attendance", back_populates="student")
    tuition_payments = relationship("TuitionPayment", back_populates="student")
    clearances = relationship("StudentClearance", back_populates="student")


class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String)
    score = Column(Float)
    term = Column(String)
    school_year = Column(String, nullable=True)

    student = relationship("Student", back_populates="academic_records")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(String)     # ISO date string e.g. "2026-03-22"
    status = Column(String)   # Present, Absent, Late
    remarks = Column(String, nullable=True)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    student = relationship("Student", back_populates="attendance_records")
    recorder = relationship("User")


class EnrollmentForm(Base):
    __tablename__ = "enrollment_forms"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    form_type = Column(String)
    status = Column(String, default="Needs Review")  # Needs Review, Success, Hold, Rejected

    # Admission Pipeline
    assessment_status = Column(String, default="Pending")   # Pending, Passed, Failed
    interview_status = Column(String, default="Pending")    # Pending, Passed, Failed
    assessment_remarks = Column(String, nullable=True)
    interview_remarks = Column(String, nullable=True)
    assessed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    interviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Structured enrollment data
    sex = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)
    birth_place = Column(String, nullable=True)
    home_address = Column(String, nullable=True)
    father_name = Column(String, nullable=True)
    father_contact = Column(String, nullable=True)
    father_occupation = Column(String, nullable=True)
    father_employer = Column(String, nullable=True)
    mother_name = Column(String, nullable=True)
    mother_contact = Column(String, nullable=True)
    mother_occupation = Column(String, nullable=True)
    mother_employer = Column(String, nullable=True)
    church_attended = Column(String, nullable=True)
    church_member = Column(String, nullable=True)
    pastor_name = Column(String, nullable=True)
    previous_school = Column(String, nullable=True)
    grade_applying_for = Column(String, nullable=True)
    repeated_grade = Column(String, nullable=True)
    expelled_dismissed = Column(String, nullable=True)
    learning_disabilities = Column(String, nullable=True)
    special_talents = Column(String, nullable=True)
    how_heard = Column(String, nullable=True)
    reason_selecting = Column(String, nullable=True)

    # New Fields (V2.0 Major Inspection Report)
    middle_name = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    religion = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_number = Column(String, nullable=True)
    allergies = Column(String, nullable=True)
    medical_conditions = Column(String, nullable=True)
    current_medications = Column(String, nullable=True)
    physician_name = Column(String, nullable=True)
    physician_contact = Column(String, nullable=True)
    waiver_agreed = Column(Integer, default=0) # bool
    consent_agreed = Column(Integer, default=0) # bool

    # Document attachments and checklist
    req_birth_cert = Column(Integer, default=0)
    req_form_138 = Column(Integer, default=0)
    req_good_moral = Column(Integer, default=0)
    req_pictures = Column(Integer, default=0)
    
    file_path = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    student = relationship("Student", backref="enrollment_forms")


class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(Integer, primary_key=True, index=True)
    tuition_id = Column(Integer, ForeignKey("tuition_payments.id"))
    amount = Column(Float)
    or_number = Column(String, index=True)
    date_recorded = Column(String)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    tuition = relationship("TuitionPayment", back_populates="payments")
    recorder = relationship("User")


class PaymentSchedule(Base):
    __tablename__ = "payment_schedules"

    id = Column(Integer, primary_key=True, index=True)
    tuition_id = Column(Integer, ForeignKey("tuition_payments.id"))
    due_date = Column(String)  # ISO date string e.g. "2026-08-30"
    amount_due = Column(Float)
    amount_paid = Column(Float, default=0.0)
    status = Column(String, default="Pending") # Paid, Pending, Overdue
    
    tuition = relationship("TuitionPayment", back_populates="schedules")


class TuitionPayment(Base):
    __tablename__ = "tuition_payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    
    # Detailed Fee Breakdown
    reg_fee = Column(Float, default=0.0)
    tuition_fee = Column(Float, default=0.0)
    energy_fee = Column(Float, default=0.0)
    books_fee = Column(Float, default=0.0)
    esc_subsidy = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    
    amount_due = Column(Float)
    amount_paid = Column(Float)
    term = Column(String)
    status = Column(String, default="Pending") # Paid, Pending, Overdue
    risk_score = Column(Float, nullable=True)

    student = relationship("Student", back_populates="tuition_payments")
    payments = relationship("PaymentRecord", back_populates="tuition")
    schedules = relationship("PaymentSchedule", back_populates="tuition")


class StudentClearance(Base):
    __tablename__ = "student_clearance"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    school_year = Column(String)
    term = Column(String)
    status = Column(String, default="Pending") # Cleared, Pending, Hold
    
    items = relationship("ClearanceItem", back_populates="clearance")
    student = relationship("Student", back_populates="clearances")


class ClearanceItem(Base):
    __tablename__ = "clearance_items"
    
    id = Column(Integer, primary_key=True, index=True)
    clearance_id = Column(Integer, ForeignKey("student_clearance.id"))
    department = Column(String) # Cashier, Library, Clinic, Registrar, Principal, Subjects...
    status = Column(String, default="Pending") # Cleared, Pending, Hold
    remarks = Column(String, nullable=True)
    cleared_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    date_cleared = Column(String, nullable=True)
    
    clearance = relationship("StudentClearance", back_populates="items")
    signer = relationship("User")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True) # Name of the account owner
    hashed_password = Column(String)
    role = Column(String)  # Administrator, Teacher, Parent, Student
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)  # Link for Student/Parent roles
    is_active = Column(Integer, default=1)
    is_archived = Column(Integer, default=0) # 0 for false, 1 for true
    section = Column(String, nullable=True)  # For Teacher role: restricts visible students to this section
    profile_picture = Column(String, nullable=True)
    schedule = Column(String, nullable=True)

class AcademicWarningRemarks(Base):
    __tablename__ = "academic_warning_remarks"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String)
    remarks = Column(String)


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author_role = Column(String, nullable=True)
    created_at = Column(String)  # ISO datetime string
    is_pinned = Column(Integer, default=0)
    target_section = Column(String, nullable=True)  # Section name or None for all

    author = relationship("User")


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, nullable=True)
    event_date = Column(String)  # ISO date string e.g. "2026-07-15"
    event_time = Column(String, nullable=True)  # e.g. "9:00 AM"
    location = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_section = Column(String, nullable=True)  # Section name or None for all

    creator = relationship("User")

class DocumentRequest(Base):
    __tablename__ = "document_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    document_type = Column(String) # TOR, Form 137, Certified True Copies, etc.
    status = Column(String, default="Pending") # Pending, Processing, Ready, Released, Rejected
    date_requested = Column(String)
    date_processed = Column(String, nullable=True)
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    remarks = Column(String, nullable=True)

    student = relationship("Student")
    processor = relationship("User")

class StudentHistory(Base):
    __tablename__ = "student_history"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    action = Column(String)
    description = Column(String, nullable=True)
    date_recorded = Column(String)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    student = relationship("Student")
    recorder = relationship("User")

