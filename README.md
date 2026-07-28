# Calvary Christian Academy (CCA) - Academic & Financial System

This repository contains the full stack system for the Calvary Christian Academy, integrating ML-powered predictive tuition risk analytics, automated AI report generation, and academic tracking.

## 🛠️ Technology Stack
- **Frontend:** React 19, Vite, TailwindCSS
- **Backend:** FastAPI, Python, SQLite/SQLAlchemy
- **AI/ML Integration:** Scikit-learn (RandomForest, GradientBoosting), Google Gemini 2.0 Flash

---

## 🚀 Step-by-Step Setup Guide

Follow these instructions to clone, set up, and run the project on your local machine.

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
1. **[Git](https://git-scm.com/downloads)** - For cloning the repository
2. **[Node.js (v18+)](https://nodejs.org/)** - For running the frontend
3. **[Python (3.10+)](https://www.python.org/downloads/)** - For running the backend API

---

### Step 1: Clone the Repository
Open your terminal (Command Prompt, PowerShell, or Git Bash) and run:
```bash
git clone https://github.com/itszedddd/CCA-Academic-System.git
cd CCA-Academic-System
```

---

### Step 2: Set Up the Backend (FastAPI)
The backend manages the database, API endpoints, and AI integrations.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment to manage dependencies securely:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:** 
     ```bash
     venv\Scripts\activate
     ```
   - **Mac/Linux:** 
     ```bash
     source venv/bin/activate
     ```
4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up your Environment Variables:
   - Create a file named `.env` in the `backend/` folder.
   - Add your Gemini API key inside it:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
6. Start the Backend Server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The API will be available at `http://127.0.0.1:8000`. Leave this terminal window running.*

---

### Step 3: Set Up the Frontend (React/Vite)
The frontend handles the user interface and interacts with the backend API.

1. Open a **new** terminal window/tab and navigate to the frontend folder:
   ```bash
   cd CCA-Academic-System/frontend
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```
   *The UI will usually be available at `http://localhost:5173/`. Follow the local link provided in your terminal.*

---

### Step 4 (Optional): Serve Publicly via Ngrok
If you need to access the system publicly (e.g., from a mobile device or sharing with an advisor), you can use ngrok.

1. Build the frontend for production (this allows the backend to serve the frontend on a single port):
   ```bash
   cd frontend
   npm run build
   ```
2. Open a new terminal in the root `CCA-Academic-System` folder.
3. Edit the `ngrok.yml` file to include your unique ngrok authtoken.
4. Run the tunnel:
   ```bash
   ngrok start cca --config ngrok.yml
   ```
   *Ngrok will provide a public HTTPS URL forwarding to your local system.*

---

## 🔑 Default Login Credentials
Once the system is running, the database will auto-seed default users if it is empty. 

You can log in using the following roles (Password is `password123` for all):
- **Principal:** principal@cca.edu.ph
- **Registrar:** registrar@cca.edu.ph
- **Cashier:** cashier@cca.edu.ph
- **Teacher:** teacher@cca.edu.ph
- **Student/Parent:** (Create an account via the registration page, or use an auto-generated one)

## 🤖 Features
- **AI Engine Diagnostics:** A dashboard for the Principal to see the status of the predictive models.
- **AI Report Generator:** Instantly generate comprehensive, narrative reports (Institutional, Academic, Finance, Attendance, and Student Profiles) using Gemini.
- **Tuition & Academic Prediction:** Identify at-risk students and tuition default risks automatically.
