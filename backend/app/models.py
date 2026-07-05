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

    # Document attachments and checklist
    req_birth_cert = Column(Integer, default=0)
    req_form_138 = Column(Integer, default=0)
    req_good_moral = Column(Integer, default=0)
    req_pictures = Column(Integer, default=0)
    
    file_path = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)


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


class TuitionPayment(Base):
    __tablename__ = "tuition_payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    amount_due = Column(Float)
    amount_paid = Column(Float)
    term = Column(String)
    status = Column(String, default="Pending") # Paid, Pending, Overdue
    risk_score = Column(Float, nullable=True)

    student = relationship("Student", back_populates="tuition_payments")
    payments = relationship("PaymentRecord", back_populates="tuition")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True) # Name of the account owner
    hashed_password = Column(String)
    role = Column(String)  # Administrator, Teacher, Parent, Student
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)  # Link for Student/Parent roles
    is_active = Column(Integer, default=1)
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
