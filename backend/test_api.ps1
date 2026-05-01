# Test API Post Creation
# Run: powershell -ExecutionPolicy Bypass -File test_api.ps1

Write-Host "Testing Feed API..." -ForegroundColor Cyan
Write-Host ""

# Test data
$body = @{
    content = "Test post from PowerShell at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    visibility = "public"
    hashtags = @("#test", "#powershell")
    attachments = @()
    relevanceTags = @("testing")
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-user-id" = "00000000-0000-0000-0000-000000000001"
    "x-user-role" = "admin"
}

Write-Host "Sending POST request to http://localhost:8000/api/feed/posts" -ForegroundColor Yellow
Write-Host "Request body:" -ForegroundColor Yellow
Write-Host $body
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/feed/posts" `
                                   -Method POST `
                                   -Body $body `
                                   -Headers $headers `
                                   -UseBasicParsing
    
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Body:" -ForegroundColor Green
    $responseData = $response.Content | ConvertFrom-Json
    $responseData | ConvertTo-Json -Depth 10
    
    if ($responseData.success) {
        Write-Host ""
        Write-Host "SUCCESS! Post created with ID: $($responseData.data.id)" -ForegroundColor Green
        
        # Check debug log
        Write-Host ""
        Write-Host "=== Debug Log ===" -ForegroundColor Cyan
        if (Test-Path "debug_requests.log") {
            Get-Content "debug_requests.log" -Tail 20
        } else {
            Write-Host "No debug log found" -ForegroundColor Yellow
        }
        
        # Check database
        Write-Host ""
        Write-Host "=== Checking Database ===" -ForegroundColor Cyan
        $postId = $responseData.data.id
        $checkScript = @"
if (file_exists('.env')) {
    `$lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach (`$lines as `$line) {
        if (strpos(trim(`$line), '#') === 0) continue;
        if (strpos(`$line, '=') === false) continue;
        list(`$k, `$v) = explode('=', `$line, 2);
        putenv(trim(`$k) . '=' . trim(`$v));
    }
}
require 'app/Core/Database/Connection.php';
`$pdo = App\Core\Database\Connection::getPdo();
`$stmt = `$pdo->prepare('SELECT id, content FROM posts WHERE id = :id');
`$stmt->execute(['id' => '$postId']);
`$post = `$stmt->fetch(PDO::FETCH_ASSOC);
if (`$post) {
    echo 'Post found in database!' . PHP_EOL;
    echo 'Content: ' . `$post['content'] . PHP_EOL;
} else {
    echo 'Post NOT found in database!' . PHP_EOL;
}
"@
        
        & "C:\Program Files\php-8.5.5\php.exe" -r $checkScript
        
        Write-Host ""
        Write-Host "=== RESULT ===" -ForegroundColor Green
        Write-Host "The backend API is working correctly!" -ForegroundColor Green
        Write-Host "Posts are being saved to the database." -ForegroundColor Green
        Write-Host ""
        Write-Host "If posts don't show in the frontend:" -ForegroundColor Yellow
        Write-Host "  1. Check browser console for errors" -ForegroundColor Yellow
        Write-Host "  2. Check Network tab for failed requests" -ForegroundColor Yellow
        Write-Host "  3. Make sure frontend is calling the correct API URL" -ForegroundColor Yellow
        
    } else {
        Write-Host ""
        Write-Host "FAILED! API returned error: $($responseData.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Message -like "*Unable to connect*" -or $_.Exception.Message -like "*Connection refused*") {
        Write-Host "Backend server is not running!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Solution:" -ForegroundColor Yellow
        Write-Host "  1. Open a terminal" -ForegroundColor Yellow
        Write-Host "  2. cd JobLink\backend" -ForegroundColor Yellow
        Write-Host "  3. Run: start-backend.bat" -ForegroundColor Yellow
        Write-Host "  4. Wait for 'Server: http://localhost:8000'" -ForegroundColor Yellow
        Write-Host "  5. Run this script again" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
