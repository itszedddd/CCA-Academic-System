@echo off
echo ========================================================
echo        Starting CCA Thesis Project Globally
echo ========================================================
echo.
echo Starting CCA Backend (Port 8000)...
start "CCA Backend (Running in Background)" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting CCA Frontend (Vite)...
start "CCA Frontend (Running in Background)" cmd /k "cd frontend && npm.cmd run dev -- --host 0.0.0.0"

echo.
echo Both servers have been launched in separate terminal windows!
echo They will remain running even if Antigravity is closed.
echo.
echo To access them from other devices on your network:
echo   - Find your computer's local IP address (e.g., 192.168.1.X)
echo   - Frontend: http://YOUR_IP:5173
echo   - Backend API: http://YOUR_IP:8000
echo.
echo Press any key to close this launcher window (the servers will keep running).
pause > nul
