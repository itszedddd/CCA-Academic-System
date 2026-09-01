from typing import List, Dict, Any
from . import models
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

def get_enrollment_report(db: Session, school_year: str = "2026-2027") -> Dict[str, Any]:
    """Generates an enrollment summary report."""
    total_students = db.query(models.Student).filter(models.Student.is_archived == 0).count()
    
    # By Grade Level
    by_grade = dict(db.query(models.Student.grade_level, func.count(models.Student.id))
                    .filter(models.Student.is_archived == 0)
                    .group_by(models.Student.grade_level).all())
                    
    # By Section
    by_section = dict(db.query(models.Student.section, func.count(models.Student.id))
                      .filter(models.Student.is_archived == 0)
                      .group_by(models.Student.section).all())
                      
    # By Enrollment Status
    by_status = dict(db.query(models.Student.enrollment_status, func.count(models.Student.id))
                     .filter(models.Student.is_archived == 0)
                     .group_by(models.Student.enrollment_status).all())

    dropped_count = db.query(models.Student).filter(
        models.Student.is_archived == 0,
        models.Student.enrollment_status == "Dropped"
    ).count()
    
    transferred_count = db.query(models.Student).filter(
        models.Student.is_archived == 0,
        models.Student.enrollment_status == "Transferred"
    ).count()

    return {
        "title": f"Enrollment Summary - SY {school_year}",
        "total_students": total_students,
        "dropped_count": dropped_count,
        "transferred_count": transferred_count,
        "by_grade": by_grade,
        "by_section": by_section,
        "by_status": by_status
    }

def get_financial_report(db: Session) -> Dict[str, Any]:
    """Generates a financial collection summary report."""
    total_due = db.query(func.sum(models.TuitionPayment.amount_due)).scalar() or 0
    total_paid = db.query(func.sum(models.TuitionPayment.amount_paid)).scalar() or 0
    
    # Collection by Term
    by_term = dict(db.query(models.TuitionPayment.term, func.sum(models.TuitionPayment.amount_paid))
                   .group_by(models.TuitionPayment.term).all())
                   
    # Pending/Overdue
    by_status = dict(db.query(models.TuitionPayment.status, func.count(models.TuitionPayment.id))
                     .group_by(models.TuitionPayment.status).all())

    # Aging (Overdue balance)
    aging_balance = db.query(func.sum(models.TuitionPayment.amount_due - models.TuitionPayment.amount_paid)).filter(models.TuitionPayment.status == "Overdue").scalar() or 0

    # Promissory Notes (Mocked from Overdue students count for now since no exact column exists, representing students under financial agreement)
    promissory_count = db.query(models.TuitionPayment).filter(models.TuitionPayment.status == "Overdue").count()

    # Transactions (Total Payment Records)
    total_transactions = db.query(models.PaymentRecord).count()
                     
    return {
        "title": "Financial Collection Summary",
        "total_expected": total_due,
        "total_collected": total_paid,
        "collection_rate": (total_paid / total_due * 100) if total_due > 0 else 0,
        "by_term": by_term,
        "status_counts": by_status,
        "efficiency": (total_paid / total_due * 100) if total_due > 0 else 0,
        "aging_balance": aging_balance,
        "promissory_count": promissory_count,
        "total_transactions": total_transactions
    }

def get_clearance_report(db: Session, school_year: str = "2026-2027") -> Dict[str, Any]:
    """Generates a student clearance status report."""
    total_clearances = db.query(models.StudentClearance).filter(models.StudentClearance.school_year == school_year).count()
    
    cleared = db.query(models.StudentClearance).filter(
        models.StudentClearance.school_year == school_year,
        models.StudentClearance.status == "Cleared"
    ).count()
    
    pending = db.query(models.StudentClearance).filter(
        models.StudentClearance.school_year == school_year,
        models.StudentClearance.status == "Pending"
    ).count()
    
    # Pending items by department
    pending_by_dept = dict(db.query(models.ClearanceItem.department, func.count(models.ClearanceItem.id))
                           .join(models.StudentClearance)
                           .filter(models.StudentClearance.school_year == school_year, models.ClearanceItem.status == "Pending")
                           .group_by(models.ClearanceItem.department).all())
                           
    return {
        "title": f"Clearance Status Report - SY {school_year}",
        "total_records": total_clearances,
        "cleared_count": cleared,
        "pending_count": pending,
        "clearance_rate": (cleared / total_clearances * 100) if total_clearances > 0 else 0,
        "bottlenecks": pending_by_dept
    }
