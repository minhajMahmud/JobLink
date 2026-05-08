@echo off
REM JobLink - Complete Service Startup Script
REM Handles: MySQL, PHP Backend, Frontend, and Browserslist update

echo.
echo ========================================
echo   JobLink - Starting All Services
echo ========================================
echo.

REM Step 1: Update Browserslist
echo [1/4] Updating Browserslist database...
cd Frontend
call npx update-browserslist-db@latest
cd ..
echo ✓ Browserslist updated
echo.

REM Step 2: Kill existing processes on ports
echo [2/4] Clearing ports 3306, 8000, 8080, 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3306"') do taskkill /pid %%a /f 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8000"') do taskkill /pid %%a /f 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8080"') do taskkill /pid %%a /f 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8081"') do taskkill /pid %%a /f 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Ports cleared
echo.

REM Step 3: Start MySQL (if using Docker)
echo [3/4] Starting MySQL...
REM Check if MySQL is running locally
sc query MySQL80 >nul 2>&1
if %errorlevel% equ 0 (
    echo MySQL service already running
) else (
    echo Starting MySQL service...
    net start MySQL80 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ MySQL started
    ) else (
        echo ! MySQL not available as service, using local installation
    )
)
timeout /t 2 /nobreak >nul
echo.

REM Step 4: Start PHP Backend
echo [4/4] Starting PHP Backend on port 8000...
cd backend
start "JobLink Backend" cmd /k "php -S 127.0.0.1:8000"
cd ..
timeout /t 3 /nobreak >nul
echo ✓ Backend started on http://localhost:8000
echo.

REM Step 5: Start Frontend
echo [5/5] Starting Frontend on port 8080...
cd Frontend
start "JobLink Frontend" cmd /k "npm run dev"
cd ..
timeout /t 3 /nobreak >nul
echo ✓ Frontend starting on http://localhost:8080
echo.

echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Frontend:  http://localhost:8080
echo Backend:   http://localhost:8000
echo MySQL:     localhost:3306
echo.
echo Login: seeker@demo.com / password123
echo.
echo Press any key to continue...
pause >nul
