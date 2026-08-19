# System Requirements & Tech Stack Documentation
**System:** Calvary Christian Academy (CCA) - Web-Based AI-Assisted Student Information and Academic Monitoring System

This document outlines the updated technology stack, software prerequisites, and hardware requirements necessary to develop, deploy, and operate the system efficiently.

---

## 1. Technology Stack

The application utilizes a modern decoupled architecture, combining a fast React-based frontend with a robust Python/FastAPI backend, integrated with Machine Learning and Generative AI capabilities.

### Frontend
| Component | Technology | Version / Detail |
| :--- | :--- | :--- |
| **Framework** | React | `^19.2.4` |
| **Build Tool** | Vite | `^8.0.1` |
| **Styling** | Tailwind CSS | `^4.2.2` |
| **Language** | JavaScript (ES6+) | With JSX |

### Backend
| Component | Technology | Version / Detail |
| :--- | :--- | :--- |
| **Framework** | FastAPI | High-performance API framework |
| **ASGI Server** | Uvicorn | `[standard]` for production-grade serving |
| **Database** | SQLite | Development/Local deployment (`.db` files) |
| **ORM** | SQLAlchemy | Relational database mapping |
| **Data Validation** | Pydantic | Type checking and schema validation |
| **Authentication** | Passlib, python-jose | Secure password hashing and JWT token management |

### AI & Machine Learning Integrations
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Machine Learning** | Scikit-learn, NumPy | `RandomForest`, `GradientBoosting` for predictive analytics (Early Warning Systems, Tuition Risk). |
| **Generative AI** | Google Generative AI | Integration with Gemini (2.0 Flash) for automated narrative report generation. |

---

## 2. Software Requirements

To run, develop, or deploy the application locally, the following software must be installed on the host machine:

| Application | Minimum Version | Role |
| :--- | :--- | :--- |
| **Python** | `3.10+` | Backend runtime environment. Required for FastAPI and ML models. |
| **Node.js** | `18.0+` | Frontend runtime environment. Required for Vite and npm packages. |
| **npm** | `9.0+` | Node package manager (comes with Node.js). |
| **Git** | Current Stable | Version control system for repository management. |
| **IDE / Code Editor**| VS Code / Cursor | Recommended for development. |
| **Web Browser** | Chrome, Edge, Safari | Modern browser for testing and accessing the application. |
| **API Testing** | Postman / Insomnia | (Optional) For testing backend endpoints, though FastAPI provides built-in Swagger UI at `/docs`. |

---

## 3. Hardware Requirements

### Minimum Requirements (For Staff/Administrative Use)
These are the minimum hardware specifications required for end-users (teachers, cashiers, registrars) accessing the web application.

*   **Processor**: Intel Core i3 or AMD Ryzen 3 (Dual-core 2.4GHz or higher)
*   **Memory (RAM)**: 8GB DDR4
*   **Storage**: 256GB Solid State Drive (SSD)
*   **Display**: Standard 1080p (1920x1080) monitor for optimal dashboard data visibility.
*   **Peripherals**: Keyboard, Mouse, and an optional high-resolution scanner/camera (for physical document uploads).

### Recommended Requirements (For Local Development)
Developers running both the frontend build process and backend machine learning models locally should meet these specifications.

*   **Processor**: Intel Core i5 / AMD Ryzen 5 or equivalent (Quad-core or better)
*   **Memory (RAM)**: 16GB (Running Vite, Uvicorn, VS Code, and ML models concurrently consumes significant memory)
*   **Storage**: 512GB SSD 

### Network & Connectivity
*   **Internet Connection**: A stable broadband connection is strictly required for both development and production environments. The system relies on external API calls to the **Google Gemini API** for report generation, which will fail if the system is offline.
