from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys
from pydantic import BaseModel
from typing import Optional

sys.path.append(os.path.join(os.getcwd(), 'backend'))
import app.models as models
import app.schemas as schemas

class MockPayload:
    student_first_name = "Test"
    student_last_name = "User"
    grade_applying_for = "Grade 7"
    sex = "Male"
    birth_date = "2000-01-01"
    home_address = "123 Test St"
    contact_number = "1234567890"
    father_name = "Father"
    
    def model_dump(self, exclude=None):
        return {
            "grade_applying_for": self.grade_applying_for,
            "sex": self.sex,
            "birth_date": self.birth_date,
            "home_address": self.home_address,
            "contact_number": self.contact_number,
            "father_name": self.father_name,
            "waiver_agreed": True,
            "consent_agreed": True
        }

payload = MockPayload()
payload_data = payload.model_dump(exclude={"student_first_name", "student_last_name"})

try:
    db_form = models.EnrollmentForm(
        student_id=1,
        form_type="Online Pre-Registration",
        status="Needs Review",
        assessment_status="Pending",
        interview_status="Pending",
        **payload_data
    )
    print("Success creating model in memory")
except Exception as e:
    print(f"Error creating model: {e}")
