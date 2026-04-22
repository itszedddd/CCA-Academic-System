# 📊 System Diagrams Documentation
## House of Puppies (HOP) & Calvary Christian Academy (CCA)

> This document thoroughly explains every ERD and Flowchart for both systems. Use it as your **panelist cheat-sheet** — every question they might ask is addressed here.

---

# Part 1: House of Puppies (HOP)

## 1.1 ERD — Entity Relationship Diagram

File: [HOP_ERD.drawio](file:///c:/Users/ender/Programming/Thesis_Project/HOP_ERD.drawio)

### Entity Summary Table

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **Role** | Lookup table defining the 5 granular staff roles | `name` (owner, vet_admin, staff_records, staff_sms, staff_inventory) |
| **Staff** | System users / clinic employees | `username`, `passwordHash`, FK → Role |
| **PetOwner** | Client records (pet parents) | `firstName`, `lastName`, `contactNumber` |
| **Pet** | Animals registered at the clinic | `name`, `species`, `breed`, FK → PetOwner |
| **PurposeOfVisit** | Lookup for visit types | grooming, check_up, surgery, lab_test, vaccination |
| **ClinicalRecord** | Core medical record per visit | Vitals, complaints, vax history, diagnosis, treatment, price |
| **PrescriptionRecord** | Medications prescribed per record | `medicationName`, `dosage`, `instructions`, FK → ClinicalRecord |
| **SmsReminder** | AI-scheduled SMS follow-up reminders | `message` (AI-generated), `reminderDate`, FK → ClinicalRecord |
| **ReminderType** | Lookup for reminder categories | follow_up, vaccination_due, lab_test_sched, grooming |
| **SmsStatus** | Lookup for SMS delivery states | sent, pending, failed |
| **Form** | Consent/waiver documents per pet | `formFileLink`, FK → Pet, FK → FormType |
| **FormType** | Lookup for form categories | waiver_lab_test, sedation_grooming, surgery_consent |
| **Inventory** | Clinic stock management | `itemName`, `stock`, `expiryDate`, FK → ItemType |
| **ItemType** | Lookup for inventory categories | medication, grooming, lab_supply |

### Relationship Breakdown

```
Role ──(1:M)──→ Staff         "One role can be assigned to many staff"
PetOwner ──(1:M)──→ Pet       "One owner can have many pets"
Pet ──(1:M)──→ ClinicalRecord "One pet can have many clinic visits"
Pet ──(1:M)──→ Form           "One pet can have many consent forms"
PurposeOfVisit ──(1:M)──→ ClinicalRecord  "One visit type applies to many records"
Staff ──(1:M)──→ ClinicalRecord   "One staff member creates many records"
ClinicalRecord ──(1:M)──→ PrescriptionRecord  "One visit can generate many prescriptions"
ClinicalRecord ──(1:M)──→ SmsReminder         "One visit can trigger many reminders"
ReminderType ──(1:M)──→ SmsReminder  "One type categorizes many reminders"
SmsStatus ──(1:M)──→ SmsReminder     "One status applies to many reminders"
ItemType ──(1:M)──→ Inventory        "One type categorizes many items"
FormType ──(1:M)──→ Form             "One form type applies to many forms"
```

### How It Connects (What to Tell the Panelist)

> "The HOP database follows a **normalized relational design** with lookup tables to avoid data redundancy. The central entity is `ClinicalRecord`, which connects the **pet** (who was treated), the **staff member** (who created the intake), and the **purpose** (why they visited). From each clinical record, the veterinarian can create **prescriptions** and the SMS staff can schedule **AI-generated reminders**. The **Role** table enables our granular access control — instead of hard-coding roles, we store them as a separate entity, making the system extensible."

---

## 1.2 Flowchart — System Process Flow

File: [HOP_System_Flowchart.drawio](file:///c:/Users/ender/Programming/Thesis_Project/HOP_System_Flowchart.drawio)

### Process Flow Summary

```
START → Enter Credentials → Valid? 
  ├── No → Error Message → Retry
  └── Yes → Identify Role
        ├── owner → Analytics Dashboard
        │     ├── Revenue Charts (Weekly/Monthly/Yearly)
        │     ├── Income Comparisons (% change vs prev period)
        │     ├── Generate Clinic Reports
        │     ├── Manage Employees (CRUD)
        │     └── View Clients, Pets, Inventory
        │
        ├── vet_admin → Veterinary Queue
        │     ├── View Pending-Vet Patient Queue
        │     ├── Examine Patient (Diagnosis + Treatment)
        │     ├── Write Prescriptions
        │     ├── Set Price & Complete Record
        │     ├── Print Prescription (PDF)
        │     └── Access ALL System Modules
        │
        ├── staff_records → Records Dashboard
        │     ├── Register New Client
        │     ├── Register New Pet
        │     ├── Submit Staff Intake (Vitals, Vax, History)
        │     └── Record status → "Pending-Vet" ──⟹ Handoff to Vet Queue
        │
        ├── staff_sms → AI SMS Reminders
        │     ├── Select Client & Pet
        │     ├── Choose Reminder Type
        │     ├── 🤖 AI Auto-Generates SMS Template
        │     ├── Preview & Set Schedule
        │     └── Submit (Status: Pending)
        │
        └── staff_inventory → Inventory Management
              ├── View Stock Levels & Expiry
              ├── Add / Edit Items
              ├── Update Quantities
              └── Delete Expired Items

      All roles → Logout → END
```

### Key Process: Staff-to-Vet Handoff

> [!IMPORTANT]
> The **most critical workflow** in HOP is the handoff between `staff_records` and `vet_admin`. Staff creates the intake (vitals, vaccination history, chief complaint) and sets the record to `Pending-Vet`. The vet then sees it in their queue, adds diagnosis/treatment/prescriptions, sets the price, and marks it `Completed`. This is a **two-phase clinical workflow** — no single person does everything.

### AI Features in HOP

| Feature | How It Works | Where in Flowchart |
|---------|-------------|-------------------|
| **SMS Template Engine** | Rule-based: selects a template based on reminder type (follow_up, vaccination_due, etc.) and auto-fills client name, pet name, and date | Staff SMS → "AI Auto-Generates SMS Template" |
| **Follow-Up Scheduling** | Predefined rules determine when the next visit is due based on treatment type | Embedded in SMS scheduling logic |
| **Revenue Analytics** | Computes weekly/monthly/yearly totals and calculates % change vs previous period | Owner → "Income Comparisons" |

---

# Part 2: Calvary Christian Academy (CCA)

## 2.1 ERD — Entity Relationship Diagram

File: [CCA_ERD.drawio](file:///c:/Users/ender/Programming/Thesis_Project/CCA_ERD.drawio)

### Entity Summary Table

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **User** | System login accounts | `username`, `hashed_password`, `role`, FK → Student (optional) |
| **Student** | Core student profile | `first_name`, `last_name`, `grade_level`, `section`, `enrollment_status` |
| **AcademicRecord** | Grades per subject per term | `subject`, `score` (Float), `term`, FK → Student |
| **Attendance** | Daily attendance logs | `date`, `status` (Present/Absent/Late), FK → Student, FK → User |
| **TuitionPayment** | Tuition billing ledger | `amount_due`, `amount_paid`, `status`, **`risk_score`** (AI), FK → Student |
| **PaymentRecord** | Individual payment transactions | `amount`, `or_number`, `date_recorded`, FK → TuitionPayment, FK → User |
| **EnrollmentForm** | OCR-processed enrollment documents | `file_path`, **`extracted_text`** (AI/OCR), `status`, FK → Student |

### Relationship Breakdown

```
Student ──(1:M)──→ AcademicRecord    "One student has many grade records"
Student ──(1:M)──→ Attendance        "One student has many attendance entries"
Student ──(1:M)──→ TuitionPayment    "One student has many tuition terms"
Student ──(1:M)──→ EnrollmentForm    "One student can upload many forms"
TuitionPayment ──(1:M)──→ PaymentRecord  "One tuition term has many partial payments"
User ──(M:1)──→ Student              "Many users can link to one student (e.g., parent + student both link to same student_id)"
User ──(1:M)──→ Attendance           "One user (teacher) records many attendance entries"
User ──(1:M)──→ PaymentRecord        "One user (cashier) records many payments"
```

### AI-Annotated Fields

> [!NOTE]
> Two fields in the CCA ERD are explicitly marked with **"AI"** labels because they are computed by our AI engine, not manually entered:
> - `TuitionPayment.risk_score` — Computed by `predict_tuition_default()` using payment ratios and overdue history
> - `EnrollmentForm.extracted_text` — Generated by Tesseract OCR from uploaded enrollment form images

### How It Connects (What to Tell the Panelist)

> "The CCA database is **student-centric** — the `Student` table is the hub entity. Every other data entity (grades, attendance, tuition, enrollment forms) connects back to a student via foreign keys. The `User` table handles authentication and role-based access — importantly, Student and Parent users are **linked** to a `Student` record through `student_id`, which restricts their view to only their own data. Teacher users have a `section` field that limits their view to students in their assigned section."

---

## 2.2 Flowchart — System Process Flow

File: [CCA_System_Flowchart.drawio](file:///c:/Users/ender/Programming/Thesis_Project/CCA_System_Flowchart.drawio)

### Process Flow Summary

```
START → Login or Register?
  ├── Register (Student Self-Enrollment):
  │     ├── Fill Registration Form
  │     ├── Upload Enrollment Form (Image)
  │     ├── 🤖 Tesseract OCR Extracts Text
  │     ├── Account Created (Inactive, Pending Validation)
  │     ├── Registrar Reviews & Verifies Form
  │     └── Account Activated → Student Can Login
  │
  └── Login → Valid? 
        ├── No → Error / Account Pending
        └── Yes → JWT Token → Identify Role
              │
              ├── Administrator → Full System Access
              │     ├── Manage Users (CRUD all roles)
              │     ├── Manage Students (Enrollment, Sections)
              │     ├── 🤖 Institutional Analytics (AI Warnings, Revenue)
              │     └── View All Grades, Attendance, Tuition
              │
              ├── Registrar → Enrollment Management
              │     ├── Review Enrollment Forms (OCR Results)
              │     ├── Verify & Activate Student Accounts
              │     ├── Create Student Records & Sections
              │     └── Record Attendance
              │
              ├── Teacher → Section-Based View
              │     ├── View Students (Own Section Only)
              │     ├── Record Grades (Subject + Term + Score)
              │     ├── Record Attendance
              │     └── 🤖 AI: View Academic Warnings
              │
              ├── Cashier → Payment Processing
              │     ├── View Tuition Ledger
              │     ├── Record Payment (Amount, OR#, Date)
              │     ├── Auto-Update Balance & Status
              │     └── 🤖 AI: View Risk Score (Default Prediction)
              │
              └── Student/Parent → Read-Only Dashboard
                    ├── View Own Grades & Academic Records
                    ├── View Own Attendance History
                    ├── View Tuition Balance & Payments
                    └── 🤖 AI: Resource Recommendations

        All roles → Logout → END
```

### Key Process: Student Self-Registration with OCR

> [!IMPORTANT]
> CCA has a **self-registration workflow** that HOP does not. Students fill out a form and upload a photo of their enrollment document. The system uses **Tesseract OCR** to extract text automatically. The account is created in an **inactive state** (`is_active = 0`). The **Registrar** then reviews the OCR output, verifies the data, and activates the account. This prevents unauthorized access while reducing manual data entry.

### AI Features in CCA

| Feature | Algorithm | Input | Output |
|---------|-----------|-------|--------|
| **Grade Trend Analysis** | Linear regression (`numpy.polyfit`) | Array of scores per subject | Slope value; warning if ≤ -3.0 (declining) |
| **Resource Recommendations** | Rule-based catalog matching | Subject averages < 75 | Top curated resource (Khan Academy, etc.) |
| **Tuition Default Prediction** | Payment ratio + overdue multiplier | `amount_due`, `amount_paid`, overdue count | Risk score 0.0–0.95 |
| **OCR Document Processing** | Tesseract image-to-text | Uploaded enrollment form image | Extracted text string |

---

# Part 3: Comparative Analysis

## Role Systems Compared

| Aspect | HOP | CCA |
|--------|-----|-----|
| **Auth Method** | Session-based (NextAuth) | JWT Token (FastAPI) |
| **Role Storage** | Separate `Role` table (FK) | String column on `User` table |
| **Number of Roles** | 5 (owner, vet_admin, staff_records, staff_sms, staff_inventory) | 6 (Administrator, Registrar, Teacher, Cashier, Parent, Student) |
| **Self-Registration** | ❌ No (admin creates accounts) | ✅ Yes (student self-enrollment with OCR) |
| **Section-Based Access** | ❌ N/A | ✅ Teachers are limited to their assigned section |

## AI Features Compared

| AI Feature | HOP | CCA |
|------------|-----|-----|
| **Rule-Based Templates** | ✅ SMS message auto-generation | ❌ |
| **Predictive Analytics** | ✅ Revenue comparisons & trends | ✅ Grade trend analysis, tuition risk prediction |
| **Resource Recommendations** | ❌ | ✅ Subject-based educational resource suggestions |
| **OCR** | ❌ | ✅ Tesseract for enrollment form processing |
| **Automated Scheduling** | ✅ Follow-up date determination | ❌ |

---

# Part 4: Panelist Q&A Preparation

## ❓ "How is this AI?"

> "Our systems use **rule-based AI** combined with automation and basic predictive analytics. In HOP, rule-based AI is applied in prescription management and follow-up scheduling — the system automatically determines due dates for vaccinations and return visits based on predefined veterinary rules. The SMS engine uses templates that are auto-populated with patient data. In CCA, we use **linear regression** for grade trend analysis, a **risk scoring model** for tuition default prediction, and **Tesseract OCR** for automated document processing. The AI is designed to improve **decision support**, **automate repetitive tasks**, and **enhance data organization** rather than replace human judgment."

## ❓ "Why did you separate roles into a lookup table in HOP but not in CCA?"

> "HOP has a **normalized design** where roles are stored in a separate table linked via foreign keys. This allows us to add or modify roles without changing code — just add a row to the `Role` table. CCA uses a simpler **string column** approach because the roles are fewer and more stable (Administrator, Teacher, etc. won't change). Both approaches are valid; we chose based on the extensibility needs of each system."

## ❓ "How does RBAC prevent unauthorized access?"

> "In HOP, every page-level component checks the user's role from the session before rendering. If the role isn't in the allowed list, the user is redirected to the login page. The sidebar navigation also filters menu items by role, so users never even see links they can't access. In CCA, the FastAPI backend validates the JWT token on every API request and checks `current_user.role` before executing any operation. Teachers are additionally restricted by their assigned `section`."

## ❓ "What is the workflow for a pet visit?"

> "1. `staff_records` registers the client and pet (if new). 2. Staff submits the intake form with vitals, vaccination history, and chief complaint. Record status = `Pending-Vet`. 3. `vet_admin` sees the record in their queue, examines the patient, writes the diagnosis and treatment, creates prescriptions, sets the price, and marks the record `Completed`. 4. `staff_sms` can then schedule an AI-generated SMS reminder for the follow-up visit. 5. `owner` sees the revenue from this visit reflected in the analytics dashboard."

## ❓ "What happens if a student registers but hasn't been verified?"

> "The student's account is created with `is_active = 0` and enrollment status = `Pending Validation`. If they try to log in, the system returns a 403 error with the message 'Account pending Registrar verification.' The Registrar reviews the OCR-extracted text from their uploaded enrollment form, verifies the data, and clicks 'Verify' — which sets `is_active = 1` and `enrollment_status = Enrolled`. Only then can the student access the system."

---

# Part 5: File Locations

| File | Path |
|------|------|
| HOP ERD | [HOP_ERD.drawio](file:///c:/Users/ender/Programming/Thesis_Project/HOP_ERD.drawio) |
| HOP Flowchart | [HOP_System_Flowchart.drawio](file:///c:/Users/ender/Programming/Thesis_Project/HOP_System_Flowchart.drawio) |
| CCA ERD | [CCA_ERD.drawio](file:///c:/Users/ender/Programming/Thesis_Project/CCA_ERD.drawio) |
| CCA Flowchart | [CCA_System_Flowchart.drawio](file:///c:/Users/ender/Programming/Thesis_Project/CCA_System_Flowchart.drawio) |
| HOP Prisma Schema | [schema.prisma](file:///c:/Users/ender/Programming/Zed/anotherPracticeWebsite/HOP/prisma/schema.prisma) |
| CCA SQLAlchemy Models | [models.py](file:///c:/Users/ender/Programming/Thesis_Project/backend/app/models.py) |
| CCA AI Engine | [ai_engine.py](file:///c:/Users/ender/Programming/Thesis_Project/backend/app/ai_engine.py) |
