@echo off
echo ========================================
echo Starting MySQL Server
echo ========================================
echo.
echo This requires Administrator privileges.
echo Right-click this file and select "Run as administrator"
echo.

net start MySQL97

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! MySQL is now running
    echo ========================================
) else (
    echo.
    echo ========================================
    echo FAILED! Please run as Administrator
    echo ========================================
    echo.
    echo Right-click this file and select:
    echo "Run as administrator"
)

echo.
pause
