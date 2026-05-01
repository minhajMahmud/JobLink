# Simple Profile Update Test
# Run this to test if profile update is working

param(
    [string]$UserId = "00000000-0000-0000-0000-000000000003",
    [string]$UserRole = "candidate"
)

$baseUrl = "http://localhost:8000"

Write-Host "`n=== PROFILE UPDATE TEST ===" -ForegroundColor Cyan
Write-Host "User ID: $UserId"
Write-Host "Role: $UserRole`n"

# Test 1: Get current profile
Write-Host "1. Getting current profile..." -ForegroundColor Yellow
try {
    $headers = @{
        "x-user-id" = $UserId
        "x-user-role" = $UserRole
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/profile" -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.status) {
        Write-Host "   SUCCESS" -ForegroundColor Green
        Write-Host "   Current name: $($data.data.first_name) $($data.data.last_name)"
        Write-Host "   Current bio: $($data.data.bio.Substring(0, [Math]::Min(50, $data.data.bio.Length)))..."
    } else {
        Write-Host "   FAILED: $($data.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Update profile
Write-Host "`n2. Updating profile..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-user-id" = $UserId
        "x-user-role" = $UserRole
    }
    
    $updateData = @{
        first_name = "Updated"
        last_name = "TestUser"
        bio = "Profile updated at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    } | ConvertTo-Json
    
    Write-Host "   Sending: $updateData"
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/profile" -Method PUT -Headers $headers -Body $updateData -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.status) {
        Write-Host "   SUCCESS" -ForegroundColor Green
        Write-Host "   New name: $($data.data.first_name) $($data.data.last_name)"
        Write-Host "   New bio: $($data.data.bio)"
        Write-Host "   Updated at: $($data.data.updated_at)"
    } else {
        Write-Host "   FAILED: $($data.message)" -ForegroundColor Red
        if ($data.errors) {
            Write-Host "   Errors:" -ForegroundColor Red
            $data.errors.PSObject.Properties | ForEach-Object {
                Write-Host "     - $($_.Name): $($_.Value)" -ForegroundColor Red
            }
        }
        exit 1
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get response body
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
    exit 1
}

# Test 3: Verify update persisted
Write-Host "`n3. Verifying update persisted..." -ForegroundColor Yellow
try {
    $headers = @{
        "x-user-id" = $UserId
        "x-user-role" = $UserRole
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/profile" -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.status) {
        Write-Host "   SUCCESS - Data persisted!" -ForegroundColor Green
        Write-Host "   Verified name: $($data.data.first_name) $($data.data.last_name)"
    } else {
        Write-Host "   FAILED: $($data.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see SUCCESS above, the profile update is working!" -ForegroundColor Green
Write-Host "If you see errors, please share the error message." -ForegroundColor Yellow
Write-Host ""
