# Project Documentation: Calvary Christian Academy

## Proposed System
**Web-Based AI-Assisted Student Information and Academic Monitoring System**

---

### 1. Techstack
The system utilizes a modern full-stack architecture with a focus on AI integration and responsive design.

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 (Vite) |
| **Styling** | TailwindCSS 4 |
| **Backend Framework** | FastAPI (Python) |
| **Database** | SQLite (Development) / PostgreSQL (Optional) |
| **ORM** | SQLAlchemy |
| **AI/OCR** | PyTesseract (Tesseract OCR), Pillow |
| **Machine Learning** | Scikit-learn, Pandas, NumPy |
| **API Documentation** | Swagger UI / Redoc (Built-in FastAPI) |

---

### 2. Software Applications Used
| Application | Version / Role |
| :--- | :--- |
| **Visual Studio Code** | Current Stable (IDE) |
| **Python** | 3.10+ (Backend Runtime) |
| **Node.js** | 18+ (Frontend Runtime) |
| **Git** | Version Control System |
| **Postman** | API Testing and Documentation |
| **Tesseract OCR** | v5.x (OCR Engine) |
| **Vite** | Frontend Build Tool |
| **Modern Web Browser** | Microsoft Edge / Chrome |

---

### 3. Hardware Requirements
Minimum requirements for administrative and staff usage.

*   **Computing Device**:
    *   **Type**: PC or Laptop (for clinic staff use)
    *   **Processor**: Intel Core i3 or Ryzen 3 (Dual-core 2.4GHz+)
    *   **Memory (RAM)**: 8GB DDR4 (Minimum)
    *   **Storage**: 256GB SSD (for fast system performance)
*   **Connectivity**: 
    *   **Network**: Broadband Modem/Router with stable internet connection.
*   **Peripherals**: 
    *   **Scanner**: High-resolution scanner or camera (for OCR document uploads).
    *   **Display**: Standard 1080p monitor for dashboard visibility.

---

### 4. SDLC Model: Agile Model
The project follows the **Agile SDLC model** to allow for iterative development, continuous feedback, and flexibility in AI feature refinement.

#### Proposed Timetable (6 Months)
| Month | Phase | Key Activities |
| :--- | :--- | :--- |
| **Month 1** | Planning & Requirements | Identifying system problems, objectives, and user needs. |
| **Month 2** | System Design | Architecture design, UI/UX prototyping, and AI logic planning. |
| **Month 3** | Core Development | Building Student Info Module and Database structure. |
| **Month 4** | AI Integration | OCR automation development and ML tracking implementation. |
| **Month 5** | Testing & Validation | System testing, OCR accuracy validation, and bug fixing. |
| **Month 6** | Deployment & Improvement | Final deployment, staff training, and feature refinement. |

---

### 5. Features of the Proposed System
*   **Automated Enrollment (OCR)**: Extracts student data from uploaded forms directly into the database, reducing repetitive encoding.
*   **Centralized Student Database**: Secure and organized storage for all student, academic, and administrative records.
*   **AI-Powered Academic Monitoring**: Early Warning System (EWS) to detect declining performance trends based on grades.
*   **Tuition Payment Risk Prediction**: Utilizes Machine Learning to classify payment risks and improve financial oversight.
*   **Intelligent Report Generator**: Generates institutional and student reports in seconds instead of hours.
*   **Responsive Student Portal**: Allows students and parents to monitor academic progress and records in real-time.
