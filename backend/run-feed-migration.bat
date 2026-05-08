@echo off
REM Run Feed Tables Migration

echo.
echo ========================================
echo   Running Feed Tables Migration
echo ========================================
echo.

REM Check if MySQL is accessible
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL command not found!
    echo Please ensure MySQL is installed and in your PATH.
    echo.
    pause
    exit /b 1
)

echo Running migration...
mysql -u root -p joblink < database/migrations/0003_create_feed_tables.sql

if %errorlevel% equ 0 (
    echo.
    echo ✓ Migration completed successfully!
    echo.
    echo Now checking database...
    php check-feed-database.php
) else (
    echo.
    echo ✗ Migration failed!
    echo Please check your MySQL credentials and database name.
    echo.
)

pause
