@echo off
echo Starting MySQL Server...
echo.

:: Try to start MySQL service
net start MySQL97 2>nul

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] MySQL started
) else if %ERRORLEVEL% EQU 2 (
    echo [OK] MySQL is already running
) else (
    echo [INFO] Trying alternative method...
    sc start MySQL97 2>nul
    timeout /t 2 >nul
)

echo.
echo Testing database connection...
cd backend

php -r "try { $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=joblink', 'root', ''); echo '[SUCCESS] Connected to database!\n'; $stmt = $pdo->query('SELECT COUNT(*) as count FROM users'); $result = $stmt->fetch(); echo 'Users in database: ' . $result['count'] . '\n'; } catch (Exception $e) { echo '[ERROR] ' . $e->getMessage() . '\n'; echo '\nPossible fixes:\n'; echo '1. Make sure MySQL is installed\n'; echo '2. Check if database joblink exists\n'; echo '3. Verify MySQL is running on port 3306\n'; }"

echo.
echo ========================================
echo.
echo If MySQL started successfully, your backend should now work!
echo.
pause
