@echo off
echo ========================================
echo JobLink Backend Server
echo ========================================
echo.
echo PHP: C:\Program Files\php-8.5.5\php.exe
echo Config: C:\Program Files\php-8.5.5\php.ini
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

"C:\Program Files\php-8.5.5\php.exe" -c "C:\Program Files\php-8.5.5\php.ini" -S localhost:8000 -t public
