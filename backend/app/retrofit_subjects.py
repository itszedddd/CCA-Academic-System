import os
import sys
import json

from .database import SessionLocal
from . import models
from .school_config import SUBJECTS

def run_retrofit():
    db = SessionLocal()
    print("Starting retrofit...")

    # 1. Retrofit existing students
    students = db.query(models.Student).all()
    student_count = 0
    record_count = 0

    for student in students:
        if not student.grade_level:
            continue
            
        student_subjects = SUBJECTS.get(student.grade_level, [])
        if not student_subjects:
            continue

        existing_records = db.query(models.AcademicRecord).filter(
            models.AcademicRecord.student_id == student.id
        ).all()
        
        existing_subject_terms = set((r.subject, r.term) for r in existing_records)
        added_for_student = False

        for subject in student_subjects:
            for term in ["Term 1", "Term 2", "Term 3"]:
                if (subject, term) not in existing_subject_terms:
                    db_record = models.AcademicRecord(
                        student_id=student.id,
                        subject=subject,
                        score=0.0,
                        term=term,
                        school_year=student.school_year or "2026-2027"
                    )
                    db.add(db_record)
                    added_for_student = True
                    record_count += 1
        
        if added_for_student:
            student_count += 1
            
    db.commit()
    print(f"Retrofitted {student_count} students with {record_count} new academic records.")

    # 2. Retrofit existing teachers
    teachers = db.query(models.User).filter(models.User.role == "Teacher").all()
    teacher_count = 0

    for teacher in teachers:
        if not teacher.section:
            continue
            
        section_str = teacher.section
        grade_level = section_str.split(" - ")[0].strip() if " - " in section_str else section_str
        teacher_subjects = SUBJECTS.get(grade_level, [])
        
        if not teacher_subjects:
            continue
            
        # Check if schedule is empty or doesn't have these subjects
        current_schedule = json.loads(teacher.schedule) if teacher.schedule else []
        current_subject_names = set(s.get("subject") for s in current_schedule if isinstance(s, dict))
        
        updated = False
        for subj in teacher_subjects:
            if subj not in current_subject_names:
                current_schedule.append({"subject": subj, "time": ""})
                updated = True
                
        if updated:
            teacher.schedule = json.dumps(current_schedule)
            teacher_count += 1
            
    db.commit()
    print(f"Retrofitted {teacher_count} teachers with default schedules based on their section.")

    db.close()
    print("Retrofit completed.")

if __name__ == "__main__":
    run_retrofit()
