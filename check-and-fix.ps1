# Check and Fix Database Connection
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Connection Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: MySQL Service
Write-Host "1. Checking MySQL Service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name MySQL97 -ErrorAction SilentlyContinue

if ($mysqlService) {
    if ($mysqlService.Status -eq 'Running') {
        Write-Host "   [OK] MySQL is running" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] MySQL is stopped" -ForegroundColor Red
        Write-Host "   To fix: Run START_MYSQL.bat as Administrator" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Quick fix:" -ForegroundColor Cyan
        Write-Host "   1. Right-click START_MYSQL.bat" -ForegroundColor White
        Write-Host "   2. Select 'Run as administrator'" -ForegroundColor White
    }
} else {
    Write-Host "   [ERROR] MySQL97 service not found" -ForegroundColor Red
}

Write-Host ""

# Check 2: Backend Server
Write-Host "2. Checking Backend Server..." -ForegroundColor Yellow
$backendPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($backendPort) {
    Write-Host "   [OK] Backend is running on port 8000" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] Backend is not running" -ForegroundColor Yellow
    Write-Host "   To fix: Run this command in backend folder:" -ForegroundColor Cyan
    Write-Host "   php -S 127.0.0.1:8000 -t public" -ForegroundColor White
}

Write-Host ""

# Check 3: Database Configuration
Write-Host "3. Checking Database Configuration..." -ForegroundColor Yellow
$envFile = "backend\.env"

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $dbHost = ($envContent | Select-String "DB_HOST=").ToString().Split("=")[1]
    $dbPort = ($envContent | Select-String "DB_PORT=").ToString().Split("=")[1]
    $dbName = ($envContent | Select-String "DB_DATABASE=").ToString().Split("=")[1]
    $dbUser = ($envContent | Select-String "DB_USERNAME=").ToString().Split("=")[1]
    
    Write-Host "   Database: $dbName" -ForegroundColor White
    Write-Host "   Host: $dbHost" -ForegroundColor White
    Write-Host "   Port: $dbPort" -ForegroundColor White
    Write-Host "   User: $dbUser" -ForegroundColor White
} else {
    Write-Host "   [ERROR] .env file not found" -ForegroundColor Red
}

Write-Host ""

# Check 4: Test Database Connection
Write-Host "4. Testing Database Connection..." -ForegroundColor Yellow

if ($mysqlService -and $mysqlService.Status -eq 'Running') {
    $testScript = @"
try {
    `$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=joblink', 'root', '');
    echo 'SUCCESS';
} catch (Exception `$e) {
    echo 'ERROR: ' . `$e->getMessage();
}
"@
    
    $result = php -r $testScript 2>&1
    
    if ($result -like "*SUCCESS*") {
        Write-Host "   [OK] Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Cannot connect to database" -ForegroundColor Red
        Write-Host "   $result" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Possible fixes:" -ForegroundColor Yellow
        Write-Host "   1. Check MySQL password in backend\.env" -ForegroundColor White
        Write-Host "   2. Verify database 'joblink' exists" -ForegroundColor White
        Write-Host "   3. Check MySQL is accepting connections" -ForegroundColor White
    }
} else {
    Write-Host "   [SKIPPED] MySQL is not running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($mysqlService.Status -eq 'Running' -and $backendPort) {
    Write-Host "Status: All systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now login at: http://localhost:8080/login" -ForegroundColor Cyan
} else {
    Write-Host "Status: Action required" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    
    if ($mysqlService.Status -ne 'Running') {
        Write-Host "1. Start MySQL: Run START_MYSQL.bat as Administrator" -ForegroundColor White
    }
    
    if (-not $backendPort) {
        Write-Host "2. Start Backend: cd backend && php -S 127.0.0.1:8000 -t public" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
