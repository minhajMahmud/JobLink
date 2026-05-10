@echo off
REM Setup User Profile System

echo.
echo ========================================
echo   User Profile System Setup
echo ========================================
echo.

echo [1/2] Running database migration...
mysql -u root -p joblink < database/migrations/0005_create_user_profile_tables.sql

if %errorlevel% equ 0 (
    echo ✓ Migration completed successfully!
    echo.
    echo Tables created:
    echo   - user_experience
    echo   - user_education
    echo   - user_projects
    echo   - user_publications
    echo   - user_certifications
    echo   - user_skills
    echo   - skill_endorsements
    echo   - user_custom_urls
    echo   - user_resume_data
    echo.
) else (
    echo ✗ Migration failed!
    echo Please check your MySQL credentials.
    pause
    exit /b 1
)

echo [2/2] Verifying tables...
mysql -u root -p joblink -e "SHOW TABLES LIKE 'user_%';"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Register routes in your main router
echo 2. Restart backend server
echo 3. Test endpoints
echo.
pause
