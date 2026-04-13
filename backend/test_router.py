import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app.models import Attendance, Student

db = SessionLocal()

# 1. First get some actual student and date
att = db.query(Attendance).first()
if not att:
    print("No attendance found")
else:
    print(f"Found existing: student_id={att.student_id}, date={att.date}, status={att.status}")
    # Try the same logic as the router
    existings = db.query(Attendance).filter(
        Attendance.student_id == att.student_id,
        Attendance.date == att.date
    ).all()
    print(f"Duplicates for this date: {len(existings)}")
    
    # Try deleting
    for ex in existings:
        db.delete(ex)

    db.commit()
    print("Deleted successfully")
    
db.close()
