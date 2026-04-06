# Database Summary

## Database: `cca.db` (65536 bytes)

### Table: `students` (4 rows)
| id | first_name | last_name | grade_level | section | contact_email | profile_image | enrollment_status |
|---|---|---|---|---|---|---|---|
| 1 | Juan | Dela Cruz | Grade 10 | Rizal | parent_juan@example.com | https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Jose_Rizal_full.jpg/220px-Jose_Rizal_full.jpg | Enrolled |
| 2 | Maria | Clara | Grade 10 | Rizal | parent_maria@example.com | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/La_Bulaquena_by_Juan_Luna.jpg/220px-La_Bulaquena_by_Juan_Luna.jpg | Enrolled |
| 3 | Andres | Bonifacio | Grade 9 | Jacinto | parent_andres@example.com | https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Andr%C3%A9s_Bonifacio.jpg/220px-Andr%C3%A9s_Bonifacio.jpg | Pending |
| 4 | fat | lum | Pre-Kinder | None | None | /uploads/pf_1775305290.png | Enrolled |

### Table: `academic_records` (5 rows)
| id | student_id | subject | score | term |
|---|---|---|---|---|
| 1 | 1 | Math | 88.5 | Term 1 |
| 2 | 1 | Science | 85.0 | Term 1 |
| 3 | 2 | Math | 95.0 | Term 1 |
| 4 | 2 | Science | 92.5 | Term 1 |
| 5 | 3 | Math | 78.0 | Term 1 |

### Table: `enrollment_forms` (1 rows)
| id | student_id | form_type | file_path | extracted_text | status |
|---|---|---|---|---|---|
| 1 | 4 | Pre-Registration Application | uploads\form_1775305290_Student Dashboard.png | ERROR: OCR failed — tesseract is not installed or it's not in your PATH. See README file for more information. | Success |

### Table: `tuition_payments` (3 rows)
| id | student_id | amount_due | amount_paid | term | status | risk_score |
|---|---|---|---|---|---|---|
| 1 | 1 | 35000.0 | 35000.0 | Term 1 | Paid | 0.1 |
| 2 | 2 | 35000.0 | 15000.0 | Term 1 | Pending | 0.5 |
| 3 | 3 | 35000.0 | 0.0 | Term 1 | Overdue | 0.8 |

### Table: `users` (6 rows)
| id | username | hashed_password | role | student_id | is_active | section |
|---|---|---|---|---|---|---|
| 1 | admin | $pbkdf2-sha256$29000$uzem9D6HcC4FYOw9ZwyhtA$jRFULFFLDpSlUdWnBA883zOJHczgCu1Cco9GWBp9a3w | Administrator | None | 1 | None |
| 2 | teacher | $pbkdf2-sha256$29000$X8s5p5QyBoCQcq6VMgYgpA$/j5Eb0Va4BuvcY00.Z3Qr2CGaexoYXV0slNYDtA.iHc | Teacher | None | 1 | None |
| 3 | cashier | $pbkdf2-sha256$29000$1Pq/9743RihlTCmlNEaodQ$MEmhHzhJTiQ58UD/.OFMc3YZckaFiMLTbgtbweb0qx0 | Cashier | None | 1 | None |
| 4 | registrar | $pbkdf2-sha256$29000$qfW.VwqB8B6DEOJ8j7G2Vg$l46e.VlaHEOS7rTMGFA4lTOTLY8NBVOsR7hwYeTA1Pw | Registrar | None | 1 | None |
| 5 | student | $pbkdf2-sha256$29000$qNX6XyvlPIcQIuQ8xzhHqA$4sjws3ECFPlzcCJ.GT2QVcMy3CIPQGYW0IT36Lc2PfM | Student | 1 | 1 | None |

### Table: `attendance` (0 rows)

## Database: `sis.db` (61440 bytes)

### Table: `students` (4 rows)
| id | first_name | last_name | grade_level | enrollment_status |
|---|---|---|---|---|
| 1 | Alice | Smith | Grade 10 | Enrolled |
| 2 | Bob | Jones | Grade 10 | Enrolled |
| 3 | Charlie | Brown | Grade 8 | Enrolled |
| 4 | Kentaro | Coronel | Kindergarten | Enrolled |

### Table: `enrollment_forms` (1 rows)
| id | student_id | form_type | file_path | extracted_text | status |
|---|---|---|---|---|---|
| 1 | None | Student Registration | uploads\Screenshot 2026-03-05 192658.png | ERROR: Tesseract OCR is not installed or not in PATH. Please install Tesseract. | Success |

### Table: `academic_records` (12 rows)
| id | student_id | subject | score | term |
|---|---|---|---|---|
| 1 | 1 | Math | 85.0 | Term 1 |
| 2 | 1 | Math | 88.0 | Term 2 |
| 3 | 1 | Math | 90.0 | Term 3 |
| 4 | 1 | Math | 92.0 | Term 4 |
| 5 | 2 | Math | 95.0 | Term 1 |

### Table: `users` (0 rows)

### Table: `payments` (0 rows)

