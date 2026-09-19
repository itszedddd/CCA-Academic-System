# CCA EduSys — AI Feature Proposals Documentation

**System**: Calvary Christian Academy Educational System (CCA EduSys)  
**Document Version**: 1.0  
**Date**: September 18, 2026  
**Purpose**: Proposed AI-powered features to strengthen the system's artificial intelligence capabilities beyond automation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current AI Architecture](#current-ai-architecture)
3. [Proposed Feature 1: AI-Powered Document Verification (Gemini Vision)](#proposed-feature-1-ai-powered-document-verification-gemini-vision)
4. [Proposed Feature 2: Natural Language Database Querying (Text-to-SQL)](#proposed-feature-2-natural-language-database-querying-text-to-sql)
5. [Proposed Feature 3: AI-Powered Semantic Search & Policy Retrieval (RAG)](#proposed-feature-3-ai-powered-semantic-search--policy-retrieval-rag)
6. [AI vs. Automation Justification Matrix](#ai-vs-automation-justification-matrix)
8. [Technical Integration Architecture](#technical-integration-architecture)
9. [References](#references)

---

## Executive Summary

This document proposes three (3) advanced AI-powered features for the CCA EduSys to complement the existing Machine Learning models (Random Forest Classifier, Gradient Boosting Regressor) and Generative AI integrations (Google Gemini). Each proposed feature addresses a genuine AI problem domain — **Computer Vision**, **Natural Language Understanding**, and **Unsupervised Learning** — ensuring the system demonstrates a comprehensive application of artificial intelligence beyond simple automation or rule-based logic.

---

## Current AI Architecture

The CCA EduSys currently employs the following AI/ML components:

| Component | Type | Algorithm | Purpose |
|---|---|---|---|
| Student At-Risk Early Warning System | Supervised Classification | Random Forest Classifier (scikit-learn) | Predicts academic failure probability using 8 engineered features |
| Tuition Payment Default Predictor | Supervised Regression | Gradient Boosting Regressor (scikit-learn) | Predicts tuition delinquency risk score (0.0–0.95) |
| Dashboard AI Insights Generator | Generative AI (LLM) | Google Gemini 2.0 Flash | Generates natural language dashboard insights from school data |
| AI Report Generator | Generative AI (LLM) | Google Gemini 2.0 Flash | Produces 5 types of narrative institutional/student reports |
| AI Chat Assistant | Generative AI (LLM) | Google Gemini 2.0 Flash | Conversational assistant with real-time database access |

**Panel Concern**: Some components may be perceived as automation (rule-based prompting) rather than true AI. The following proposals address this by introducing features that require genuine AI reasoning, learning, and multi-step inference.

---

## Proposed Feature 1: AI-Powered Document Verification (Gemini Vision)

### 1.1 Problem Statement

During the enrollment process, the Registrar manually verifies submitted documents (birth certificates, Form 138/SF10, certificates of good moral character, and ID photos). This process is:
- **Time-consuming**: Each document must be visually inspected and compared to form data
- **Error-prone**: Human reviewers may miss discrepancies between document content and form entries
- **Unscalable**: Peak enrollment periods create bottlenecks

### 1.2 Proposed Solution

Implement a multi-step AI pipeline using **Google Gemini's multimodal (vision) capabilities** to automatically:

1. **Document Classification** — Identify what type of document was uploaded (birth certificate, report card, good moral certificate, photo, or unknown)
2. **Information Extraction** — Extract key fields from the document using OCR + AI comprehension (student name, date of birth, school name, grades, etc.)
3. **Cross-Validation** — Compare extracted data against the student's enrollment form entries
4. **Mismatch Detection & Flagging** — Alert the Registrar to discrepancies with specific details

### 1.3 AI Techniques Used

| Technique | Classification | Description |
|---|---|---|
| **Computer Vision** | AI | Gemini Vision API processes uploaded document images |
| **Optical Character Recognition (OCR)** | AI | Extracts text from scanned/photographed documents |
| **Natural Language Processing (NLP)** | AI | Understands and parses extracted text into structured fields |
| **Entity Extraction** | AI | Identifies named entities (person names, dates, school names) |
| **Cross-Referencing Logic** | AI-assisted | Compares extracted entities to database records using fuzzy matching |

### 1.4 Data Flow

```
Student Uploads          Gemini Vision API          Structured Output
Document Image    ────>  (Multimodal Model)  ────>  (JSON: type, name,
(JPEG/PNG/PDF)                                      dob, school, etc)
                                                          |
                                                          v
                         Cross-Validation          Enrollment Form
                         Engine             <────  Database Record
                         (Fuzzy Matching)
                              |
                              v
                         Verification Result
                         ✅ Match / ⚠️ Mismatch
                         + Confidence Score
```

### 1.5 API Integration

**API Used**: Google Gemini API (Multimodal — `gemini-2.0-flash` or later with vision support)

**Sample Prompt Structure**:
```
Analyze this uploaded document image. Determine:
1. Document Type: Is this a Birth Certificate, School Report Card (Form 138/SF10), 
   Certificate of Good Moral Character, ID Photo, or Unknown?
2. Extract the following fields (if visible):
   - Full Name of Student
   - Date of Birth
   - Place of Birth
   - Name of School (if applicable)
   - Grade Level (if applicable)
   - Academic Grades (if applicable)
3. Confidence level for each extracted field (High/Medium/Low)

Return as structured JSON.
```

**Cross-Validation Example**:
```
Enrollment Form says:    Extracted from Document:    Result:
Name: Juan Dela Cruz     Name: Juan D. Dela Cruz     ✅ Match (fuzzy)
DOB: 2012-05-15          DOB: May 15, 2012           ✅ Match (format diff)
School: XYZ Academy      School: XYZ Elementary       ⚠️ Possible Mismatch
```

### 1.6 Why This is AI, Not Automation

| Aspect | Automation Would Be | This Feature Does (AI) |
|---|---|---|
| Document type detection | Check file extension or filename | **Visually analyze** image content to classify document type |
| Data extraction | Require structured digital forms | **Understand** handwritten/printed text in any format/layout |
| Name matching | Exact string comparison | **Fuzzy matching** that handles nicknames, middle names, abbreviations |
| Date comparison | Parse one format | **Interpret** multiple date formats (May 15, 2012 vs 2012-05-15 vs 05/15/12) |

---

## Proposed Feature 2: Natural Language Database Querying (Text-to-SQL)

### 2.1 Problem Statement

School administrators (Principal, Registrar, Cashier) frequently need specific data insights but lack technical SQL knowledge. Currently, they must:
- Navigate to specific dashboard pages for pre-built reports
- Request custom queries from IT staff
- Manually cross-reference data across multiple pages

### 2.2 Proposed Solution

Enable administrators to ask **natural language questions** about the school database and receive instant answers. The AI will:

1. **Parse** the natural language question to understand intent
2. **Generate** a valid SQL query based on the database schema
3. **Execute** the query safely against the database
4. **Format** the results into a human-readable response with data visualization

### 2.3 AI Techniques Used

| Technique | Classification | Description |
|---|---|---|
| **Natural Language Understanding (NLU)** | AI | Parses user intent from free-form English questions |
| **Schema-Aware Code Generation** | AI | Generates syntactically correct SQL from natural language |
| **Semantic Mapping** | AI | Maps natural language concepts ("failing students") to database fields (score < 75) |
| **Intent Classification** | AI | Determines whether query is aggregate, lookup, comparison, or trend analysis |
| **Response Generation (NLG)** | AI | Converts raw SQL results into natural language answers |

### 2.4 Data Flow

```
User Question              Gemini LLM                Generated SQL
"Which Grade 7      ────>  + Database Schema   ────> SELECT s.first_
 students have             + Column Descriptions      name, ... WHERE
 attendance below          + Safety Rules              grade_level =
 80%?"                                                'Grade 7' AND..
                                                           |
                                                           v
                           Safety Validator          SQL Sanitizer
                           (Read-Only Check)  <────  (No DROP/DELETE
                           (Role Permission)          No UPDATE)
                                |
                                v
                           Execute on Database ────> Format Results
                           (Read-Only Session)       as Table + NL
                                                     Summary
```

### 2.5 Example Queries and Generated SQL

| Natural Language Question | Generated SQL | AI Response |
|---|---|---|
| "How many students are enrolled in Grade 7?" | `SELECT COUNT(*) FROM students WHERE grade_level='Grade 7' AND enrollment_status='Enrolled'` | "There are **8 students** currently enrolled in Grade 7." |
| "Which students have overdue tuition and are also at academic risk?" | `SELECT s.first_name, s.last_name, t.amount_due - t.amount_paid AS balance FROM students s JOIN tuition_payments t ON s.id = t.student_id WHERE t.status = 'Overdue' AND t.risk_score >= 0.6` | "**3 students** have both overdue tuition and elevated risk scores: ..." |
| "Show me attendance trends for the past 3 months" | `SELECT strftime('%Y-%m', date) AS month, COUNT(CASE WHEN status='Present' THEN 1 END) * 100.0 / COUNT(*) AS rate FROM attendance GROUP BY month ORDER BY month DESC LIMIT 3` | "Attendance rates: July: 92.3%, August: 88.1%, September: 85.7% — showing a **declining trend**." |

### 2.6 Safety Mechanisms

Since the AI generates SQL that runs against the live database, the following safety layers are critical:

1. **Read-Only Enforcement**: SQL is executed in a read-only database session. Only `SELECT` statements are allowed.
2. **SQL Sanitization**: A parser rejects any query containing `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`, or `TRUNCATE`.
3. **Role-Based Scoping**: The AI adds `WHERE` clauses based on the user's role (e.g., Teachers can only query their section's students).
4. **Result Limiting**: All queries are automatically limited to 100 rows maximum.
5. **Schema Injection (Not User Data)**: Only the database schema is sent to the LLM — never raw student data. The LLM generates the query; the server executes it locally.

### 2.7 Why This is AI, Not Automation

| Aspect | Automation Would Be | This Feature Does (AI) |
|---|---|---|
| Query interface | Dropdown filters + pre-built reports | **Understand** any question in free-form English |
| SQL generation | Hardcoded query templates | **Generate novel SQL** from natural language understanding |
| Ambiguity handling | Error message | **Infer intent** (e.g., "failing" = score < 75, "behind on payments" = status Overdue) |
| Response format | Raw table dump | **Generate natural language summary** with key insights highlighted |

---

## Proposed Feature 3: AI-Powered Semantic Search & Policy Retrieval (RAG)

### 3.1 Problem Statement
The manuscript defines "Intelligent Search" and "Process Guidance" as core AI features. However, traditional keyword searches struggle when users don't know the exact terms to look for. Furthermore, providing "Process Guidance" (e.g., how to handle a specific enrollment edge case) currently relies on manual staff knowledge rather than an intelligent system.

### 3.2 Proposed Solution
Implement a **Retrieval-Augmented Generation (RAG)** pipeline. This involves embedding the school's entire knowledge base (Student Handbooks, Faculty Manuals, Enrollment Procedures, DepEd Memos) into a vector database. When a user asks the AI Assistant a question, the system uses semantic search to find the exact relevant policy documents and generates a contextualized answer.

### 3.3 AI Techniques Used
| Technique | Classification | Description |
|---|---|---|
| **Text Embedding Models** | Deep Learning / NLP | Converts text documents into high-dimensional vectors to capture semantic meaning. |
| **Vector Similarity Search** | AI Search | Finds relevant information based on *meaning* rather than exact keyword matches (e.g., matching "kicked out" to "expulsion policy"). |
| **Retrieval-Augmented Generation (RAG)** | Generative AI Architecture | Combines the retrieved factual documents with the LLM to generate accurate, hallucination-free answers. |

### 3.4 Integration with AI Assistant
1. A parent asks the Student Portal AI: *"What happens if we can't pay the tuition on time due to a medical emergency?"*
2. The AI uses Vector Search to retrieve the exact section of the CCA Financial Policy regarding "Late Payments" and "Medical Extensions".
3. The AI generates a polite, accurate response citing the school's actual policy and providing the next steps (Process Guidance).

### 3.5 Why This Fits the Scope Perfectly
This directly fulfills the manuscript's promise of **"intelligent search, natural language inquiries... and process guidance"** (Page 36, Scope) while strictly adhering to the delimitation that the system **"does not include predictive analytics"** (Page 37).

---

## AI vs. Automation Justification Matrix

This matrix helps defend each feature during a thesis panel by clearly distinguishing AI from automation:

| Feature | AI Technique | Why It's Not Automation | Defensible Claim |
|---|---|---|---|
| Document Verification | Computer Vision + NLP + Fuzzy Matching | Understands visual content; handles any document format/layout | "The system uses multimodal AI to visually interpret and cross-validate enrollment documents" |
| Text-to-SQL Querying | NLU + Code Generation + NLG | Generates novel SQL from arbitrary English; handles ambiguity | "The system employs NLU to translate administrator intent into database queries" |
| Semantic Search (RAG) | Vector Embeddings + Similarity Search + Generative AI | Understands the semantic meaning of questions instead of keyword matching | "The system utilizes a Retrieval-Augmented Generation architecture for intelligent process guidance" |

---

## Technical Integration Architecture

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **AI/ML Models** | scikit-learn (Python) | Isolation Forest, K-Means, Random Forest, Gradient Boosting |
| **Multimodal AI** | Google Gemini API (Vision + Text) | Document analysis, NL understanding, report generation |
| **Backend** | FastAPI (Python) | API endpoints, model inference, database queries |
| **Database** | SQLite / PostgreSQL (SQLAlchemy) | Student, academic, attendance, tuition data |
| **Frontend** | React 19 + Vite | User interface for all AI features |

### API Endpoints (Proposed)

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai/verify-document` | POST | Upload document image → get verification result |
| `/api/ai/query` | POST | Natural language question → SQL → formatted answer |
| `/api/ai/anomaly-scan` | GET | Run anomaly detection across all students |
| `/api/ai/anomaly/{student_id}` | GET | Get anomaly details + recommendations for one student |
| `/api/ai/clusters` | GET | Get current student cluster assignments and profiles |

---

## References

1. Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). Isolation Forest. *Proceedings of the 8th IEEE International Conference on Data Mining (ICDM)*, 413–422.
2. Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. *NAACL-HLT*.
3. Google DeepMind. (2024). Gemini: A Family of Highly Capable Multimodal Models. *arXiv preprint arXiv:2312.11805*.
4. Zhong, V., Xiong, C., & Socher, R. (2017). Seq2SQL: Generating Structured Queries from Natural Language using Reinforcement Learning. *arXiv preprint arXiv:1709.00103*.
5. Breunig, M. M., Kriegel, H. P., Ng, R. T., & Sander, J. (2000). LOF: Identifying Density-Based Local Outliers. *ACM SIGMOD Record*, 29(2), 93–104.
6. Pedregosa, F., et al. (2011). Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research*, 12, 2825–2830.
