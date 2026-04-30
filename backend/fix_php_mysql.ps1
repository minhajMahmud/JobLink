# Fix PHP MySQL Extensions
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHP MySQL Extension Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$phpPath = "C:\Program Files\php-8.5.5"
$phpIniPath = "$phpPath\php.ini"
$phpIniDevPath = "$phpPath\php.ini-development"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERROR] This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to this directory and run the script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run this command:" -ForegroundColor Yellow
    Write-Host "Start-Process powershell -Verb RunAs -ArgumentList '-File ""$PSCommandPath""'" -ForegroundColor Cyan
    pause
    exit 1
}

Write-Host "[OK] Running as Administrator" -ForegroundColor Green
Write-Host ""

# Step 1: Check if php.ini exists
Write-Host "Step 1: Checking for php.ini file..." -ForegroundColor Yellow
if (Test-Path $phpIniPath) {
    Write-Host "[OK] php.ini already exists" -ForegroundColor Green
} else {
    Write-Host "[INFO] php.ini not found, creating from template..." -ForegroundColor Yellow
    if (Test-Path $phpIniDevPath) {
        Copy-Item $phpIniDevPath -Destination $phpIniPath
        Write-Host "[OK] Created php.ini from php.ini-development" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Template file not found: $phpIniDevPath" -ForegroundColor Red
        pause
        exit 1
    }
}
Write-Host ""

# Step 2: Enable MySQL extensions
Write-Host "Step 2: Enabling MySQL extensions..." -ForegroundColor Yellow

$content = Get-Content $phpIniPath -Raw

# Enable pdo_mysql
if ($content -match ";extension=pdo_mysql") {
    $content = $content -replace ";extension=pdo_mysql", "extension=pdo_mysql"
    Write-Host "[OK] Enabled pdo_mysql extension" -ForegroundColor Green
} elseif ($content -match "^extension=pdo_mysql" -or $content -match "`nextension=pdo_mysql") {
    Write-Host "[OK] pdo_mysql already enabled" -ForegroundColor Green
} else {
    # Add it if not found
    $content += "`nextension=pdo_mysql`n"
    Write-Host "[OK] Added pdo_mysql extension" -ForegroundColor Green
}

# Enable mysqli
if ($content -match ";extension=mysqli") {
    $content = $content -replace ";extension=mysqli", "extension=mysqli"
    Write-Host "[OK] Enabled mysqli extension" -ForegroundColor Green
} elseif ($content -match "^extension=mysqli" -or $content -match "`nextension=mysqli") {
    Write-Host "[OK] mysqli already enabled" -ForegroundColor Green
} else {
    # Add it if not found
    $content += "`nextension=mysqli`n"
    Write-Host "[OK] Added mysqli extension" -ForegroundColor Green
}

# Enable extension_dir if commented
if ($content -match ";extension_dir") {
    $content = $content -replace ";extension_dir = `"ext`"", "extension_dir = `"ext`""
    Write-Host "[OK] Enabled extension_dir" -ForegroundColor Green
}

# Save the file
Set-Content -Path $phpIniPath -Value $content -NoNewline
Write-Host ""

# Step 3: Verify
Write-Host "Step 3: Verifying extensions..." -ForegroundColor Yellow
Write-Host ""

$modules = php -m
if ($modules -match "pdo_mysql") {
    Write-Host "[OK] pdo_mysql is loaded" -ForegroundColor Green
} else {
    Write-Host "[WARNING] pdo_mysql not loaded yet - may need to restart terminal" -ForegroundColor Yellow
}

if ($modules -match "mysqli") {
    Write-Host "[OK] mysqli is loaded" -ForegroundColor Green
} else {
    Write-Host "[WARNING] mysqli not loaded yet - may need to restart terminal" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. Open a NEW PowerShell/Terminal window" -ForegroundColor White
Write-Host "3. Navigate to: JobLink\backend" -ForegroundColor White
Write-Host "4. Run: php test_db_connection.php" -ForegroundColor White
Write-Host ""
Write-Host "If you're using a web server (Apache/Nginx), restart it!" -ForegroundColor Yellow
Write-Host ""

pause
