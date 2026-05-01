@echo off
echo ========================================
echo   JobLink - Starting All Services
echo ========================================

:: Kill anything on port 8000 and 8080
echo Clearing ports 8000 and 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

timeout /t 1 /nobreak >nul

:: Start PHP backend
echo Starting PHP backend on port 8000...
start "JobLink Backend" cmd /k "cd /d %~dp0backend && php -S 127.0.0.1:8000 -t public"

timeout /t 2 /nobreak >nul

:: Start Vite frontend
echo Starting Vite frontend on port 8080...
start "JobLink Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo   Services started!
echo   Frontend: http://localhost:8080
echo   Backend:  http://localhost:8000
echo ========================================
echo.
echo Login: seeker@demo.com / password123
pause
