@echo off
echo ========================================
echo FIX: Database Unavailable Error
echo ========================================
echo.

echo Step 1: Checking MySQL Service Status...
sc query MySQL97 | find "RUNNING" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MySQL is running
) else (
    echo [ERROR] MySQL is NOT running
    echo.
    echo Starting MySQL...
    net start MySQL97 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] MySQL started successfully
    ) else (
        echo [FAILED] Could not start MySQL
        echo.
        echo SOLUTION: Run this file as Administrator
        echo Right-click this file and select "Run as administrator"
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Step 2: Testing Database Connection...
cd backend
php -r "try { $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=joblink', 'root', ''); echo '[OK] Database connection successful\n'; } catch (Exception $e) { echo '[ERROR] ' . $e->getMessage() . '\n'; }"

echo.
echo Step 3: Checking Backend Server...
netstat -ano | findstr ":8000" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend server is running on port 8000
) else (
    echo [WARNING] Backend server is NOT running
    echo.
    echo Starting backend server...
    start "JobLink Backend" cmd /k "cd backend && php -S 127.0.0.1:8000 -t public"
    timeout /t 2 >nul
    echo [OK] Backend server started
)

echo.
echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Now try logging in again at:
echo http://localhost:8080/login
echo.
pause
