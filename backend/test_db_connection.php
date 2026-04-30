<?php

declare(strict_types=1);

// Test database connection
echo "Testing Database Connection...\n\n";

// Load environment variables
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
    }
    echo "✓ Environment variables loaded\n";
} else {
    echo "✗ .env file not found\n";
    exit(1);
}

// Get database configuration
$driver = getenv('DB_DRIVER') ?: 'mysql';
$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$database = getenv('DB_DATABASE') ?: 'joblink';
$username = getenv('DB_USERNAME') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

echo "\nDatabase Configuration:\n";
echo "  Driver: $driver\n";
echo "  Host: $host\n";
echo "  Port: $port\n";
echo "  Database: $database\n";
echo "  Username: $username\n";
echo "  Password: " . (empty($password) ? '(empty)' : '***') . "\n\n";

// Test connection
try {
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    echo "Step 1: Connecting to MySQL server...\n";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo "✓ Successfully connected to MySQL server\n\n";

    // Check if database exists
    echo "Step 2: Checking if database '$database' exists...\n";
    $stmt = $pdo->query("SHOW DATABASES LIKE '$database'");
    $dbExists = $stmt->fetch();
    
    if ($dbExists) {
        echo "✓ Database '$database' exists\n\n";
        
        // Connect to the database
        echo "Step 3: Connecting to database '$database'...\n";
        $dsn = "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        echo "✓ Successfully connected to database '$database'\n\n";
        
        // Check for users table
        echo "Step 4: Checking for 'users' table...\n";
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        $tableExists = $stmt->fetch();
        
        if ($tableExists) {
            echo "✓ 'users' table exists\n";
            
            // Count users
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
            $result = $stmt->fetch();
            echo "  Total users: " . $result['count'] . "\n\n";
        } else {
            echo "✗ 'users' table does NOT exist\n";
            echo "  You need to run the database migrations!\n\n";
        }
        
        echo "=================================\n";
        echo "DATABASE CONNECTION: SUCCESS ✓\n";
        echo "=================================\n";
        
    } else {
        echo "✗ Database '$database' does NOT exist\n\n";
        echo "Creating database '$database'...\n";
        $pdo->exec("CREATE DATABASE `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "✓ Database '$database' created successfully\n\n";
        echo "=================================\n";
        echo "NEXT STEP: Run migrations to create tables\n";
        echo "=================================\n";
    }
    
} catch (PDOException $e) {
    echo "\n=================================\n";
    echo "DATABASE CONNECTION: FAILED ✗\n";
    echo "=================================\n\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    
    if (strpos($e->getMessage(), 'Access denied') !== false) {
        echo "Possible causes:\n";
        echo "  1. MySQL username or password is incorrect\n";
        echo "  2. User '$username' doesn't have access permissions\n";
        echo "  3. MySQL server is not running\n\n";
        echo "Solutions:\n";
        echo "  - Check your .env file credentials\n";
        echo "  - Start MySQL server (XAMPP, WAMP, or standalone MySQL)\n";
        echo "  - Verify MySQL is running on port $port\n";
    } elseif (strpos($e->getMessage(), 'Connection refused') !== false) {
        echo "Possible causes:\n";
        echo "  1. MySQL server is not running\n";
        echo "  2. MySQL is running on a different port\n";
        echo "  3. Firewall is blocking the connection\n\n";
        echo "Solutions:\n";
        echo "  - Start MySQL server (XAMPP, WAMP, or standalone MySQL)\n";
        echo "  - Check if MySQL is running: netstat -an | findstr :3306\n";
        echo "  - Verify the port in your .env file\n";
    }
    
    exit(1);
}
