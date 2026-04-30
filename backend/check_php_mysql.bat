@echo off
echo ========================================
echo PHP MySQL Extension Checker
echo ========================================
echo.

echo Checking PHP version...
php -v
echo.

echo ========================================
echo Checking PHP Configuration Files...
echo ========================================
php --ini
echo.

echo ========================================
echo Checking for MySQL Extensions...
echo ========================================
echo.
echo Looking for pdo_mysql:
php -m | findstr /i "pdo_mysql"
if %errorlevel% equ 0 (
    echo [OK] pdo_mysql is ENABLED
) else (
    echo [ERROR] pdo_mysql is NOT ENABLED
)
echo.

echo Looking for mysqli:
php -m | findstr /i "mysqli"
if %errorlevel% equ 0 (
    echo [OK] mysqli is ENABLED
) else (
    echo [ERROR] mysqli is NOT ENABLED
)
echo.

echo ========================================
echo Testing Database Connection...
echo ========================================
php test_db_connection.php
echo.

echo ========================================
echo INSTRUCTIONS TO FIX:
echo ========================================
echo.
echo If extensions are NOT enabled:
echo 1. Find your php.ini file (usually in C:\xampp\php\php.ini)
echo 2. Open it with a text editor (as Administrator)
echo 3. Find these lines:
echo    ;extension=pdo_mysql
echo    ;extension=mysqli
echo 4. Remove the semicolon (;) at the beginning
echo 5. Save the file
echo 6. Restart Apache/Web Server
echo 7. Run this script again to verify
echo.
pause
