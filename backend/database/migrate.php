<?php
declare(strict_types=1);

/**
 * JobLink Database Migration Runner
 * Usage:  php database/migrate.php [--seed]
 *
 * Flags:
 *   --seed   also run seeds/seed_users.sql after migration
 *   --fresh  drop & recreate (uses 0000_master_schema.sql only)
 */

// ── Load .env ────────────────────────────────────────────────
$envFile = __DIR__ . '/../.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        putenv(trim($k) . '=' . trim($v));
    }
}

$host   = getenv('DB_HOST')     ?: '127.0.0.1';
$port   = getenv('DB_PORT')     ?: '3306';
$dbName = getenv('DB_DATABASE') ?: 'joblink';
$user   = getenv('DB_USERNAME') ?: 'root';
$pass   = getenv('DB_PASSWORD') ?: '';

$seed  = in_array('--seed',  $argv ?? [], true);
$fresh = in_array('--fresh', $argv ?? [], true);

// ── Connect (create DB if missing) ───────────────────────────
try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbName`");
    echo "[OK] Connected to MySQL — using database `$dbName`\n";
} catch (PDOException $e) {
    echo "[ERROR] Cannot connect: " . $e->getMessage() . "\n";
    exit(1);
}

// ── Helper: run a SQL file ────────────────────────────────────
function runFile(PDO $pdo, string $path): void
{
    if (!is_file($path)) {
        echo "[SKIP] File not found: $path\n";
        return;
    }
    $sql = file_get_contents($path);
    if ($sql === false || trim($sql) === '') {
        echo "[SKIP] Empty file: $path\n";
        return;
    }
    // Split on semicolons (skip empty statements)
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
        try {
            $pdo->exec($stmt);
        } catch (PDOException $e) {
            // Ignore "already exists" type warnings in non-fresh mode
            if (!str_contains($e->getMessage(), '1050') && !str_contains($e->getMessage(), '1060')) {
                echo "[WARN] " . basename($path) . ": " . $e->getMessage() . "\n";
            }
        }
    }
    echo "[OK]  Ran: " . basename($path) . "\n";
}

$migrationsDir = __DIR__ . '/migrations';
$seedsDir      = __DIR__ . '/seeds';

if ($fresh) {
    // ── Fresh mode: run master schema only ───────────────────
    echo "\n=== FRESH MIGRATION ===\n";
    runFile($pdo, $migrationsDir . '/0000_master_schema.sql');
} else {
    // ── Normal mode: run all migration files in order ────────
    echo "\n=== RUNNING MIGRATIONS ===\n";
    $files = glob($migrationsDir . '/*.sql') ?: [];
    sort($files);
    foreach ($files as $file) {
        // Skip master schema in normal mode (it drops everything)
        if (str_contains($file, '0000_master_schema')) continue;
        runFile($pdo, $file);
    }
}

if ($seed) {
    echo "\n=== RUNNING SEEDS ===\n";
    runFile($pdo, $seedsDir . '/seed_users.sql');
}

echo "\n=== DONE ===\n";
echo "Accounts created (if --seed was used):\n";
echo "  admin@joblink.com      password: Admin@1234\n";
echo "  employer@joblink.com   password: Employer@1234\n";
echo "  seeker@joblink.com     password: Seeker@1234\n\n";
