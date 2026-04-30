@echo off
echo ========================================
echo PHP MySQL Extension Fix
echo ========================================
echo.
echo This will:
echo 1. Create php.ini file if missing
echo 2. Enable pdo_mysql extension
echo 3. Enable mysqli extension
echo.
echo This requires Administrator privileges!
echo.
pause

PowerShell -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File ""%~dp0fix_php_mysql.ps1""' -Verb RunAs"

echo.
echo Script launched with Administrator privileges.
echo Follow the instructions in the new window.
echo.
pause
