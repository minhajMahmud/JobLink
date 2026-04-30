@echo off
setlocal

:: Set PHPRC for this session so child processes inherit it
set PHPRC=C:\Program Files\php-8.5.5

echo ========================================
echo JobLink Backend Server (Workaround)
echo ========================================
echo.
echo PHPRC: %PHPRC%
echo PHP: %PHPRC%\php.exe
echo Server: http://localhost:8000
echo.
echo Test accounts:
echo   seeker@joblink.com    / Seeker@1234
echo   employer@joblink.com  / Employer@1234
echo   admin@joblink.com     / Admin@1234
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

"%PHPRC%\php.exe" -S localhost:8000 -t public

endlocal
