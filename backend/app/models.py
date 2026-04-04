from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    grade_level = Column(String)
    section = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)    # Parent/Guardian email
    profile_image = Column(String, nullable=True)    # External URL mapping
    enrollment_status = Column(String, default="Pending")  # Enrolled, Pending, Dropped

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
    file_path = Column(String)
    extracted_text = Column(String, nullable=True)
    status = Column(String, default="Processing")  # Processing, Success, Needs Review


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


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # Administrator, Teacher, Parent, Student
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)  # Link for Student/Parent roles
    is_active = Column(Integer, default=1)
