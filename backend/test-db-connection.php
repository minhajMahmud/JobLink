<?php

echo "=== Database Connection Test ===\n\n";

// Load .env
$envPath = __DIR__ . '/.env';
if (is_file($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }
        [$name, $value] = explode('=', $trimmed, 2);
        $name = trim($name);
        $value = trim($value);
        if ($name === '') {
            continue;
        }
        putenv($name . '=' . $value);
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
    echo "[OK] .env file loaded\n";
} else {
    echo "[ERROR] .env file not found\n";
    exit(1);
}

// Get config
$config = require __DIR__ . '/config/database.php';

echo "\nConfiguration:\n";
echo "  Driver: " . $config['driver'] . "\n";
echo "  Host: " . $config['host'] . "\n";
echo "  Port: " . $config['port'] . "\n";
echo "  Database: " . $config['database'] . "\n";
echo "  Username: " . $config['username'] . "\n";
echo "  Password: " . (empty($config['password']) ? '(empty)' : '***') . "\n\n";

// Test connection
try {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $config['host'],
        $config['port'],
        $config['database']
    );
    
    echo "Connecting with DSN: $dsn\n";
    
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "[SUCCESS] Connected to database!\n\n";
    
    // Test query
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM users');
    $result = $stmt->fetch();
    echo "Users in database: " . $result['count'] . "\n";
    
    // Test login user
    $stmt = $pdo->prepare('SELECT id, email, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute(['seeker@demo.com']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "\nTest user found:\n";
        echo "  ID: " . $user['id'] . "\n";
        echo "  Email: " . $user['email'] . "\n";
        echo "  Role: " . $user['role'] . "\n";
    } else {
        echo "\n[WARNING] Test user 'seeker@demo.com' not found\n";
    }
    
    echo "\n[SUCCESS] All tests passed!\n";
    
} catch (PDOException $e) {
    echo "[ERROR] Database connection failed:\n";
    echo "  " . $e->getMessage() . "\n";
    echo "\nPossible fixes:\n";
    echo "  1. Make sure MySQL is running\n";
    echo "  2. Check database 'joblink' exists\n";
    echo "  3. Verify username/password in .env\n";
    exit(1);
}
