"""Seed mock enrollment form OCR data into the CCA database."""
import sqlite3

conn = sqlite3.connect("cca.db")
c = conn.cursor()

mock_forms = [
    (1, "Enrollment Form", "uploads/form_enroll_delaCruz.png",
     "CALVARY CHRISTIAN ACADEMY\nENROLLMENT FORM SY 2025-2026\n\nStudent Name: Juan Dela Cruz\nGrade Level: Grade 7\nSection: Humility\nDate of Birth: March 15, 2012\nParent/Guardian: Maria Dela Cruz\nContact: 0917-123-4567\nAddress: 123 Rizal St, Quezon City\n\nPrevious School: St. Mary Academy\nReason for Transfer: Relocation\n\nSignature: ______________________",
     "Success"),

    (2, "Enrollment Form", "uploads/form_enroll_santos.png",
     "CALVARY CHRISTIAN ACADEMY\nENROLLMENT FORM SY 2025-2026\n\nStudent Name: Maria Santos\nGrade Level: Grade 8\nSection: Courage\nDate of Birth: July 22, 2011\nParent/Guardian: Pedro Santos\nContact: 0918-456-7890\nAddress: 456 Mabini Ave, Manila\n\nPrevious School: New enrollee\nReason for Transfer: N/A\n\nSignature: ______________________",
     "Success"),

    (3, "Enrollment Form", "uploads/form_enroll_garcia.png",
     "CALVARY CHRISTIAN ACADEMY\nENROLLMENT FORM SY 2025-2026\n\nStudent Name: Carlos Garcia\nGrade Level: Grade 9\nSection: Goodwill\nDate of Birth: November 5, 2010\nParent/Guardian: Ana Garcia\nContact: 0919-789-0123\nAddress: 789 Bonifacio Blvd, Pasig City\n\nPrevious School: Holy Cross School\nReason for Transfer: Better curriculum\n\nSignature: ______________________",
     "Success"),

    (4, "Enrollment Form", "uploads/form_enroll_reyes.png",
     "CALVARY CHRISTIAN ACADEMY\nENROLLMENT FORM SY 2025-2026\n\nStudent Name: Angela Reyes\nGrade Level: Grade 10\nSection: Persistence\nDate of Birth: January 30, 2009\nParent/Guardian: Roberto Reyes\nContact: 0920-321-6543\nAddress: 321 Aguinaldo St, Makati\n\nPrevious School: CCA (continuing)\nReason for Transfer: N/A\n\nSignature: ______________________",
     "Success"),

    (5, "Enrollment Form", "uploads/form_enroll_mendoza.png",
     "CALVARY CHRISTIAN ACADEMY\nENROLLMENT FORM SY 2025-2026\n\nStudent Name: Miguel Mendoza\nGrade Level: Grade 7\nSection: Humility\nDate of Birth: April 18, 2012\nParent/Guardian: Elena Mendoza\nContact: 0916-654-9876\nAddress: 654 Luna St, Taguig\n\nPrevious School: Philippine Science HS\nReason for Transfer: Proximity",
     "Needs Review"),

    (6, "Enrollment Form", "uploads/form_enroll_villanueva.png",
     "CALVARY CHRISTIAN ACADEMY\nENROLLMENT FORM SY 2025-2026\n\nStudent Name: Sofia Villanueva\nGrade Level: Kinder\nDate of Birth: September 12, 2019\nParent/Guardian: Jose Villanueva\nContact: 0921-111-2222\nAddress: 88 Katipunan Road, QC\n\nPrevious School: First-time enrollee\n\nSignature: ______________________",
     "Success"),

    (7, "Report Card", "uploads/form_rc_ramos.png",
     "CALVARY CHRISTIAN ACADEMY\nSTUDENT REPORT CARD (SF9)\nSY 2025-2026\n\nStudent: Patrick Ramos — Grade 8 Courage\n\nFilipino: Q1=85 Q2=82 Q3=80 Q4=78\nEnglish: Q1=90 Q2=88 Q3=85 Q4=87\nMathematics: Q1=75 Q2=72 Q3=70 Q4=68\nScience: Q1=88 Q2=85 Q3=83 Q4=80\nAP: Q1=82 Q2=80 Q3=79 Q4=77\nMAPEH: Q1=92 Q2=90 Q3=88 Q4=89\n\nGeneral Average: 81.5%",
     "Success"),

    (8, "Birth Certificate", "uploads/form_bc_torres.png",
     "REPUBLIC OF THE PHILIPPINES\nCERTIFICATE OF LIVE BIRTH\n\nRegistry No: 2011-12345\n\nChild Name: Isabela Torres\nDate of Birth: June 8, 2011\nPlace of Birth: Manila Doctors Hospital\nSex: Female\n\nFather: Ricardo Torres\nMother: Carmen Torres (nee Gonzales)\n\nDate Registered: June 15, 2011",
     "Success"),
]

# Clear existing mock data and insert fresh
c.execute("DELETE FROM enrollment_forms")
for sid, ftype, fpath, text, status in mock_forms:
    c.execute(
        "INSERT INTO enrollment_forms (student_id, form_type, file_path, extracted_text, status) VALUES (?, ?, ?, ?, ?)",
        (sid, ftype, fpath, text, status)
    )

conn.commit()
print(f"OK - Inserted {len(mock_forms)} mock enrollment forms into cca.db")
conn.close()
