@echo off
echo ========================================
echo Starting JobLink Application
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 8000)...
cd backend
start "JobLink Backend" cmd /k "php -S 127.0.0.1:8000 -t public"
cd ..
timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 8080)...
cd Frontend
start "JobLink Frontend" cmd /k "npm run dev -- --port 8080"
cd ..

echo.
echo ========================================
echo ✓ All servers started!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:8080
echo.
echo Press any key to close this window...
pause >nul
