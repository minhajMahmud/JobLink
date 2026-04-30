================================================================================
                    FIX "DATABASE UNAVAILABLE" ERROR
================================================================================

PROBLEM: PHP MySQL extensions are not enabled
LOCATION: C:\Program Files\php-8.5.5\php.ini (file doesn't exist yet)

================================================================================
                           QUICK FIX (2 MINUTES)
================================================================================

STEP 1: Run the Fix Script
---------------------------
1. Open File Explorer
2. Navigate to: E:\JobLink\JobLink\backend
3. Double-click: FIX_PHP_MYSQL_ADMIN.bat
4. Click "Yes" when asked for Administrator permission
5. Wait for "Fix Complete!" message
6. Close the window

STEP 2: Restart Terminal
-------------------------
1. Close your current PowerShell/Terminal window
2. Open a NEW PowerShell/Terminal window
3. This is IMPORTANT - changes won't work in old terminal!

STEP 3: Test Connection
------------------------
1. cd JobLink\backend
2. php test_db_connection.php
3. Should see: "DATABASE CONNECTION: SUCCESS ✓"

STEP 4: Try Login
-----------------
1. Open your application
2. Try to login
3. Should work without "Database unavailable" error!

================================================================================
                         WHAT THE SCRIPT DOES
================================================================================

1. Creates php.ini file from template
2. Enables: extension=pdo_mysql
3. Enables: extension=mysqli
4. Enables: extension_dir = "ext"

================================================================================
                           MANUAL FIX (BACKUP)
================================================================================

If the script doesn't work, do this manually:

1. Open PowerShell as Administrator:
   - Press Win + X
   - Click "Windows Terminal (Admin)"

2. Run these commands:
   cd "C:\Program Files\php-8.5.5"
   Copy-Item "php.ini-development" -Destination "php.ini"
   notepad php.ini

3. In Notepad, find and change:
   ;extension=pdo_mysql    →    extension=pdo_mysql
   ;extension=mysqli       →    extension=mysqli

4. Save (Ctrl+S) and close Notepad

5. Close and reopen your terminal

6. Test: php -m | findstr mysql

================================================================================
                              VERIFICATION
================================================================================

After fix, this command:
    php -m | findstr mysql

Should show:
    mysqli
    mysqlnd
    pdo_mysql

And this command:
    php test_db_connection.php

Should show:
    DATABASE CONNECTION: SUCCESS ✓

================================================================================
                           NEED HELP?
================================================================================

Check these files:
- FIX_NOW.md - Detailed instructions
- QUICK_FIX_GUIDE.md - Visual guide
- DATABASE_CONNECTION_FIX.md - Complete documentation

Or run:
- check_php_mysql.bat - Diagnostic tool

================================================================================
                         COMMON MISTAKES
================================================================================

❌ Forgot to close and reopen terminal after editing php.ini
❌ Didn't run as Administrator
❌ Edited wrong php.ini file (check: php --ini)
❌ Left semicolon (;) at the beginning of extension lines

================================================================================

REMEMBER: Close and reopen terminal after making changes!

================================================================================
