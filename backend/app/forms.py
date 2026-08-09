import datetime

FORM_TEMPLATES = [
    {"id": "student_info", "name": "Student Information Form", "description": "Personal info, parents, guardian, address"},
    {"id": "enrollment", "name": "Enrollment/Pre-Registration Form", "description": "Academic history, grade applying for"},
    {"id": "id_form", "name": "Student ID Form", "description": "Photo, name, grade, section, emergency contact"},
    {"id": "consent", "name": "Consent Form", "description": "Parental consent for activities, photo release"},
    {"id": "medical", "name": "Medical Form", "description": "Health info, allergies, medications, emergency contact"},
    {"id": "waiver", "name": "Waiver Form", "description": "Liability waiver with terms"}
]

def generate_form_html(form_type: str, student_data: dict) -> str:
    """Generates print-ready HTML for a specific form type using student data."""
    
    # Common Header
    header = f"""
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a365d; padding-bottom: 15px;">
        <h2 style="color: #1a365d; margin: 0; font-size: 24px;">Calvary Christian Academy</h2>
        <p style="margin: 5px 0; color: #4a5568;">Excellence in Christian Education</p>
        <p style="margin: 5px 0; color: #718096; font-size: 14px;">SY {student_data.get('school_year', '2026-2027')}</p>
    </div>
    """
    
    # Common Footer
    footer = """
    <div style="margin-top: 50px; font-size: 12px; color: #718096; text-align: center;">
        <p>This is a computer-generated document. CCA EduSys v2.</p>
    </div>
    """
    
    content = ""
    
    if form_type == "student_info":
        content = f"""
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">Student Information Form</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px; width: 30%;"><strong>Student Name:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('first_name', '')} {student_data.get('last_name', '')}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px;"><strong>Grade Level:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('grade_level', '')}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px;"><strong>Section:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('section', 'TBA')}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px;"><strong>Email:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('contact_email', '')}</td>
            </tr>
        </table>
        
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Parent/Guardian Signature
            </div>
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Date
            </div>
        </div>
        """
        
    elif form_type == "enrollment":
        content = f"""
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">Enrollment / Pre-Registration Form</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px; width: 30%;"><strong>Student Name:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('first_name', '')} {student_data.get('last_name', '')}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px;"><strong>Applying For:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('grade_level', '')}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px;"><strong>Enrollment Status:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('enrollment_status', '')}</td>
            </tr>
        </table>
        
        <h4>Requirements Checklist</h4>
        <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 10px;">[ {'X' if student_data.get('req_birth_cert') else ' '} ] Birth Certificate</li>
            <li style="margin-bottom: 10px;">[ {'X' if student_data.get('req_form_138') else ' '} ] Form 138 (Report Card)</li>
            <li style="margin-bottom: 10px;">[ {'X' if student_data.get('req_good_moral') else ' '} ] Certificate of Good Moral Character</li>
            <li style="margin-bottom: 10px;">[ {'X' if student_data.get('req_pictures') else ' '} ] 2x2 ID Pictures</li>
        </ul>
        
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Student/Parent Signature
            </div>
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Registrar Signature
            </div>
        </div>
        """
        
    elif form_type == "id_form":
        content = f"""
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">Student ID Form</h3>
        
        <div style="display: flex; gap: 20px; align-items: start;">
            <div style="width: 150px; height: 150px; border: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; text-align: center; color: #94a3b8;">
                Attach 2x2 Photo Here
            </div>
            <div style="flex-grow: 1;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px; width: 30%;"><strong>Full Name:</strong></td>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px;">{student_data.get('first_name', '')} {student_data.get('last_name', '')}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px;"><strong>Grade & Section:</strong></td>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px;">{student_data.get('grade_level', '')} - {student_data.get('section', 'TBA')}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px;"><strong>Contact Person:</strong></td>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px;">___________________________</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px;"><strong>Contact Number:</strong></td>
                        <td style="border-bottom: 1px solid #cbd5e1; padding: 10px;">___________________________</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div style="margin-top: 50px; border-top: 1px solid #000; text-align: center; padding-top: 5px; width: 50%; margin-left: auto; margin-right: auto;">
            Student Signature
        </div>
        """
    
    elif form_type == "consent":
        content = f"""
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">Parental Consent & Photo Release Form</h3>
        
        <p>I/We, the parent(s)/guardian(s) of <strong>{student_data.get('first_name', '')} {student_data.get('last_name', '')}</strong>, currently enrolled in <strong>{student_data.get('grade_level', '')}</strong> for the School Year {student_data.get('school_year', '2026-2027')}, hereby grant Calvary Christian Academy the permission to:</p>
        
        <ul style="line-height: 1.8;">
            <li>Allow my child to participate in school-sanctioned activities and events.</li>
            <li>Take photographs and videos of my child during school activities for educational and promotional purposes.</li>
            <li>Publish my child's academic and extracurricular achievements in school publications.</li>
        </ul>
        
        <p style="margin-top: 30px;">I understand that this consent will remain in effect for the duration of the current school year.</p>
        
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Parent/Guardian Signature over Printed Name
            </div>
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Date
            </div>
        </div>
        """

    elif form_type == "medical":
        content = f"""
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">Student Medical Form</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px; width: 30%;"><strong>Student Name:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('first_name', '')} {student_data.get('last_name', '')}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px;"><strong>Grade Level:</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">{student_data.get('grade_level', '')}</td>
            </tr>
        </table>
        
        <h4>Health Information</h4>
        <p>Please list any known allergies (food, medication, environmental):</p>
        <div style="border: 1px solid #cbd5e1; height: 60px; margin-bottom: 20px;"></div>
        
        <p>Current Medications:</p>
        <div style="border: 1px solid #cbd5e1; height: 60px; margin-bottom: 20px;"></div>
        
        <p>Medical Conditions (Asthma, Diabetes, etc.):</p>
        <div style="border: 1px solid #cbd5e1; height: 60px; margin-bottom: 20px;"></div>
        
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Parent/Guardian Signature
            </div>
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Date
            </div>
        </div>
        """
        
    elif form_type == "waiver":
        content = f"""
        <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 20px;">Liability Waiver</h3>
        
        <p>Student Name: <strong>{student_data.get('first_name', '')} {student_data.get('last_name', '')}</strong></p>
        <p>Grade Level: <strong>{student_data.get('grade_level', '')}</strong></p>
        
        <p style="text-align: justify; line-height: 1.6; margin-top: 20px;">
            I hereby agree to release, indemnify, and hold harmless Calvary Christian Academy, its administrators, teachers, and staff from any and all liability, claims, demands, or causes of action whatsoever arising out of or related to any loss, damage, or injury, including death, that may be sustained by my child while participating in any school-related activity, on or off school premises.
        </p>
        
        <p style="text-align: justify; line-height: 1.6;">
            I acknowledge that I have read this waiver, fully understand its terms, and sign it freely and voluntarily.
        </p>
        
        <div style="margin-top: 80px; display: flex; justify-content: space-between;">
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Parent/Guardian Signature over Printed Name
            </div>
            <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px;">
                Date
            </div>
        </div>
        """
    else:
        content = f"<p>Unknown form type: {form_type}</p>"
        
    # Wrap in HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>CCA Form - {form_type}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            @media print {{
                body {{
                    padding: 0;
                }}
                @page {{
                    margin: 2cm;
                }}
            }}
        </style>
    </head>
    <body>
        {header}
        {content}
        {footer}
    </body>
    </html>
    """
    
    return full_html
