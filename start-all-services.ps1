# JobLink - Complete Service Startup Script (PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File start-all-services.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JobLink - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill process on port
function Kill-Port {
    param([int]$Port)
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Killed process on port $Port" -ForegroundColor Green
    }
}

# Step 1: Update Browserslist
Write-Host "[1/5] Updating Browserslist database..." -ForegroundColor Yellow
Push-Location Frontend
npx update-browserslist-db@latest
Pop-Location
Write-Host "✓ Browserslist updated" -ForegroundColor Green
Write-Host ""

# Step 2: Clear ports
Write-Host "[2/5] Clearing ports..." -ForegroundColor Yellow
Kill-Port 3306
Kill-Port 8000
Kill-Port 8080
Kill-Port 8081
Start-Sleep -Seconds 2
Write-Host "✓ Ports cleared" -ForegroundColor Green
Write-Host ""

# Step 3: Start MySQL
Write-Host "[3/5] Starting MySQL..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysqlService) {
    if ($mysqlService.Status -eq "Running") {
        Write-Host "✓ MySQL already running" -ForegroundColor Green
    } else {
        Start-Service -Name "MySQL80"
        Write-Host "✓ MySQL started" -ForegroundColor Green
    }
} else {
    Write-Host "! MySQL service not found" -ForegroundColor Yellow
}
Start-Sleep -Seconds 2
Write-Host ""

# Step 4: Start Backend
Write-Host "[4/5] Starting PHP Backend on port 8000..." -ForegroundColor Yellow
Push-Location backend
Start-Process -FilePath "php" -ArgumentList "-S 127.0.0.1:8000" -WindowStyle Normal
Pop-Location
Start-Sleep -Seconds 3
Write-Host "✓ Backend started on http://localhost:8000" -ForegroundColor Green
Write-Host ""

# Step 5: Start Frontend
Write-Host "[5/5] Starting Frontend on port 8080..." -ForegroundColor Yellow
Push-Location Frontend
Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Normal
Pop-Location
Start-Sleep -Seconds 3
Write-Host "✓ Frontend starting on http://localhost:8080" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Started!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:  http://localhost:8080" -ForegroundColor Green
Write-Host "Backend:   http://localhost:8000" -ForegroundColor Green
Write-Host "MySQL:     localhost:3306" -ForegroundColor Green
Write-Host ""
Write-Host "Login: seeker@demo.com / password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
