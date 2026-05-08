@echo off
REM JobLink Backend - Standalone Startup Script

echo.
echo ========================================
echo   JobLink Backend Server
echo ========================================
echo.

REM Kill existing process on port 8000
echo Clearing port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8000"') do taskkill /pid %%a /f 2>nul
timeout /t 1 /nobreak >nul

REM Start PHP Backend
echo Starting PHP Backend on port 8000...
echo.
php -S 127.0.0.1:8000

echo.
echo Backend stopped.
pause
