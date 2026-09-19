import sys, os
from dotenv import load_dotenv
load_dotenv()
from app.database import SessionLocal
from app.models import User, Student
from app.auth import get_password_hash

sections_map = {
    'Kindergarten': ('teacher_kindergarten', 'Teacher Kindness', 'Kindness'),
    'Grade 1': ('teacher_grade1', 'Teacher Love', 'Love'),
    'Grade 2': ('teacher_grade2', 'Teacher Joyful', 'Joyful'),
    'Grade 3': ('teacher_grade3', 'Teacher Faith', 'Faith'),
    'Grade 4': ('teacher_grade4', 'Teacher Grace', 'Grace'),
    'Grade 5': ('teacher_grade5', 'Teacher Loyalty', 'Loyalty'),
    'Grade 6': ('teacher_grade6', 'Teacher Obedience', 'Obedience'),
    'Grade 7': ('teacher_grade7', 'Teacher Meekness', 'Meekness'),
    'Grade 8': ('teacher_grade8', 'Teacher Courage', 'Courage'),
    'Grade 9': ('teacher_grade9', 'Teacher Benevolence', 'Benevolence'),
    'Grade 10': ('teacher_grade10', 'Teacher Perseverance', 'Perseverance')
}

db = SessionLocal()

# 1. Delete old teachers
db.query(User).filter(User.role == 'Teacher').delete()

# 2. Add correct teachers
default_pass = get_password_hash('password123')
for grade, (t_user, t_name, t_sec) in sections_map.items():
    u = User(username=t_user, full_name=t_name, hashed_password=default_pass, role='Teacher', section=t_sec, is_active=1)
    db.add(u)

# 3. Update students in users table & students table
students = db.query(Student).all()
for s in students:
    if s.grade_level in sections_map:
        correct_section = sections_map[s.grade_level][2]
        s.section = correct_section
    
    # Update the linked user account
    f_name = s.first_name if s.first_name else ""
    l_name = s.last_name if s.last_name else ""
    full = f"{f_name} {l_name}".strip()
    
    u = db.query(User).filter(User.student_id == s.id).first()
    if u:
        u.full_name = full
        u.section = s.section

db.commit()
print('Fix applied successfully')
