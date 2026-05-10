@echo off
echo ========================================
echo Fixing Port Issues and Restarting
echo ========================================
echo.

echo [1/3] Killing processes on ports 8080-8082...
for /L %%p in (8080,1,8082) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p') do (
        echo Killing process %%a on port %%p
        taskkill /F /PID %%a 2>nul
    )
)

echo.
echo [2/3] Waiting for ports to be released...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting servers...
cd backend
start "JobLink Backend" cmd /k "php -S 127.0.0.1:8000 -t public"
cd ..

timeout /t 2 /nobreak >nul

cd Frontend
start "JobLink Frontend" cmd /k "npm run dev -- --port 8080"
cd ..

echo.
echo ========================================
echo ✓ Servers starting!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:8080
echo.
echo Wait 5-10 seconds for frontend to compile...
echo Then open: http://localhost:8080
echo.
pause
