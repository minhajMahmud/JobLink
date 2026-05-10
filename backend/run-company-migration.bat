@echo off
echo Running company profile migration...
mysql -u root joblink < database\migrations\0006_add_company_profile_fields.sql
if %ERRORLEVEL% EQU 0 (
    echo Migration completed successfully!
) else (
    echo Migration failed!
)
pause
