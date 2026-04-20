<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed. Use POST.', 405);
}

loadEnvFile(__DIR__ . '/../.env');

if (!isset($_FILES['resume'])) {
    respond(false, 'No resume file provided.', 400);
}

$resume = $_FILES['resume'];

if (!is_array($resume)) {
    respond(false, 'Invalid upload payload.', 400);
}

if (($resume['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    respond(false, mapUploadError((int) ($resume['error'] ?? UPLOAD_ERR_NO_FILE)), 400);
}

$maxFileSize = 2 * 1024 * 1024; // 2MB
$size = (int) ($resume['size'] ?? 0);
if ($size <= 0 || $size > $maxFileSize) {
    respond(false, 'File too large. Maximum allowed size is 2MB.', 400);
}

$originalName = (string) ($resume['name'] ?? 'resume');
$tmpPath = (string) ($resume['tmp_name'] ?? '');

if (!is_uploaded_file($tmpPath)) {
    respond(false, 'Possible file upload attack detected.', 400);
}

$extension = strtolower((string) pathinfo($originalName, PATHINFO_EXTENSION));
$allowedExtensions = ['pdf', 'doc', 'docx'];
$blockedExtensions = ['php', 'php3', 'php4', 'php5', 'phtml', 'phar', 'exe', 'sh', 'bat', 'cmd', 'js', 'com', 'msi'];

if (in_array($extension, $blockedExtensions, true)) {
    respond(false, 'Executable or script file uploads are not allowed.', 400);
}

if (!in_array($extension, $allowedExtensions, true)) {
    respond(false, 'Invalid format. Only PDF, DOC, DOCX are allowed.', 400);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$detectedMime = $finfo ? (string) finfo_file($finfo, $tmpPath) : '';
if ($finfo) {
    finfo_close($finfo);
}

$allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

if (!in_array($detectedMime, $allowedMimes, true)) {
    respond(false, 'Invalid MIME type. Upload a valid PDF, DOC, or DOCX file.', 400);
}

$safeBase = sanitizeBaseName((string) pathinfo($originalName, PATHINFO_FILENAME));
$uniqueName = date('Ymd_His') . '_' . bin2hex(random_bytes(8));
$fileName = $uniqueName . '_' . $safeBase . '.' . $extension;

$storageRoot = realpath(__DIR__ . '/../storage');
if ($storageRoot === false) {
    $storageRoot = __DIR__ . '/../storage';
}

$resumeDir = $storageRoot . DIRECTORY_SEPARATOR . 'resumes';
if (!is_dir($resumeDir) && !mkdir($resumeDir, 0755, true) && !is_dir($resumeDir)) {
    respond(false, 'Failed to create upload directory.', 500);
}

$destination = $resumeDir . DIRECTORY_SEPARATOR . $fileName;
if (!move_uploaded_file($tmpPath, $destination)) {
    respond(false, 'Server failed while storing the uploaded file.', 500);
}

$userId = isset($_POST['user_id']) ? trim((string) $_POST['user_id']) : null;
if ($userId === '') {
    $userId = null;
}

$storedPath = 'storage/resumes/' . $fileName;
$dbSaved = false;
$dbError = null;

try {
    $dbSaved = persistUploadRecord($userId, $storedPath);
} catch (Throwable $exception) {
    $dbError = $exception->getMessage();
}

$response = [
    'success' => true,
    'message' => 'Resume uploaded successfully.',
    'data' => [
        'file_name' => $fileName,
        'file_path' => $storedPath,
        'mime_type' => $detectedMime,
        'size' => $size,
        'upload_date' => date(DATE_ATOM),
        'user_id' => $userId,
        'db_saved' => $dbSaved,
    ],
];

if ($dbError !== null) {
    $response['warning'] = 'Upload saved, but database record could not be stored.';
}

echo json_encode($response, JSON_UNESCAPED_SLASHES);
exit;

function respond(bool $success, string $message, int $statusCode): void
{
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
    ], JSON_UNESCAPED_SLASHES);
    exit;
}

function mapUploadError(int $errorCode): string
{
    return match ($errorCode) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File too large. Maximum allowed size is 2MB.',
        UPLOAD_ERR_PARTIAL => 'File upload was incomplete. Please try again.',
        UPLOAD_ERR_NO_FILE => 'No file selected for upload.',
        UPLOAD_ERR_NO_TMP_DIR => 'Server missing temporary upload directory.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write uploaded file to disk.',
        UPLOAD_ERR_EXTENSION => 'Upload blocked by a server extension.',
        default => 'Unknown upload error occurred.',
    };
}

function sanitizeBaseName(string $baseName): string
{
    $sanitized = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName) ?? 'resume';
    $sanitized = trim($sanitized, '_-');

    if ($sanitized === '') {
        $sanitized = 'resume';
    }

    return substr($sanitized, 0, 80);
}

function loadEnvFile(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $trimmed, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key === '') {
            continue;
        }

        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }

        if (getenv($key) === false) {
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

function persistUploadRecord(?string $userId, string $filePath): bool
{
    $driver = getenv('DB_DRIVER') ?: '';
    $host = getenv('DB_HOST') ?: '';
    $port = getenv('DB_PORT') ?: '';
    $database = getenv('DB_DATABASE') ?: '';
    $username = getenv('DB_USERNAME') ?: '';
    $password = getenv('DB_PASSWORD') ?: '';

    if ($driver !== 'mysql' || $host === '' || $port === '' || $database === '' || $username === '') {
        return false;
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $database);

    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS user_resumes (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(100) NULL,
            file_path VARCHAR(255) NOT NULL,
            upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_resumes_user_id (user_id),
            INDEX idx_user_resumes_upload_date (upload_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $stmt = $pdo->prepare(
        'INSERT INTO user_resumes (user_id, file_path, upload_date)
         VALUES (:user_id, :file_path, NOW())'
    );

    return $stmt->execute([
        ':user_id' => $userId,
        ':file_path' => $filePath,
    ]);
}
