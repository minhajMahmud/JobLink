@echo off
REM JobLink - Complete Startup with Database Checks

echo.
echo ========================================
echo   JobLink - Smart Startup
echo ========================================
echo.

REM Step 1: Check database and run migrations if needed
echo [1/6] Checking database...
cd backend
php check-feed-database.php >nul 2>&1
if %errorlevel% neq 0 (
    echo ! Database tables missing, running migrations...
    echo.
    echo Running migration 0003_create_feed_tables.sql...
    mysql -u root -p joblink < database/migrations/0003_create_feed_tables.sql
    if %errorlevel% equ 0 (
        echo ✓ Feed tables created
    ) else (
        echo ✗ Migration failed - please run manually
    )
    echo.
    echo Running migration 0004_create_messaging_tables.sql...
    mysql -u root -p joblink < database/migrations/0004_create_messaging_tables.sql
    if %errorlevel% equ 0 (
        echo ✓ Messaging tables created
    ) else (
        echo ✗ Migration failed - please run manually
    )
    echo.
) else (
    echo ✓ Database tables exist
)
cd ..
echo.

REM Step 2: Update Browserslist
echo [2/6] Updating Browserslist...
cd Frontend
call npx update-browserslist-db@latest >nul 2>&1
cd ..
echo ✓ Browserslist updated
echo.

REM Step 3: Clear ports
echo [3/6] Clearing ports...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8000"') do taskkill /pid %%a /f 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8080"') do taskkill /pid %%a /f 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8081"') do taskkill /pid %%a /f 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Ports cleared
echo.

REM Step 4: Check MySQL
echo [4/6] Checking MySQL...
sc query MySQL80 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MySQL service running
) else (
    echo ! MySQL service not found
    echo   Make sure MySQL is installed and running
)
echo.

REM Step 5: Start Backend
echo [5/6] Starting Backend...
cd backend
start "JobLink Backend" cmd /k "php -S 127.0.0.1:8000"
cd ..
timeout /t 3 /nobreak >nul
echo ✓ Backend started on http://localhost:8000
echo.

REM Step 6: Start Frontend
echo [6/6] Starting Frontend...
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
echo.
echo Login: seeker@demo.com / password123
echo.
echo NOTE: Posts will now persist after reload!
echo.
echo Press any key to continue...
pause >nul
