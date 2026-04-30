# Self-elevating script — double-click or run from any terminal
# Copies php.ini-development to php.ini and enables MySQL extensions

param([switch]$Elevated)

if (-not $Elevated) {
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Elevated" -Wait
    exit
}

$phpDir  = "C:\Program Files\php-8.5.5"
$iniSrc  = "$phpDir\php.ini-development"
$iniDst  = "$phpDir\php.ini"

Write-Host "=== PHP ini installer (running as admin) ===" -ForegroundColor Cyan

# Copy template
Copy-Item $iniSrc $iniDst -Force
Write-Host "[OK] Copied php.ini-development -> php.ini" -ForegroundColor Green

# Read content
$c = [System.IO.File]::ReadAllText($iniDst)

# Enable extension_dir with absolute path
$c = $c -replace '; extension_dir = "ext"',  "extension_dir = `"$phpDir\ext`""
$c = $c -replace ';extension_dir = "ext"',   "extension_dir = `"$phpDir\ext`""

# Enable MySQL extensions
$c = $c -replace ';extension=pdo_mysql',  'extension=pdo_mysql'
$c = $c -replace ';extension=mysqli',     'extension=mysqli'

[System.IO.File]::WriteAllText($iniDst, $c, [System.Text.UTF8Encoding]::new($false))
Write-Host "[OK] Enabled: extension_dir, pdo_mysql, mysqli" -ForegroundColor Green

# Verify
$loaded = & php -m 2>&1
if ($loaded -match "pdo_mysql") {
    Write-Host "[OK] pdo_mysql confirmed loaded!" -ForegroundColor Green
} else {
    Write-Host "[WARN] pdo_mysql not showing yet - may need new terminal" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! PHP will now always load MySQL extensions." -ForegroundColor Green
Read-Host "Press Enter to close"
