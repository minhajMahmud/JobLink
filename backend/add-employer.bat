@echo off
echo ========================================
echo Adding Employer Account to Database
echo ========================================
echo.

"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" -u root -p joblink < add-employer-account.sql

echo.
echo ========================================
echo Done! Check output above for results.
echo ========================================
echo.
echo Employer Login Credentials:
echo Email: employer@demo.com
echo Password: password
echo Role: Recruiter
echo ========================================
pause
