<?php
// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
    }
}

require_once __DIR__ . '/app/Core/Database/Connection.php';
use App\Core\Database\Connection;

echo "Checking posts table schema...\n\n";

try {
    $pdo = Connection::getPdo();
    $stmt = $pdo->query('DESCRIBE posts');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns in posts table:\n";
    echo str_repeat('-', 80) . "\n";
    printf("%-25s %-30s %-10s\n", "Field", "Type", "Null");
    echo str_repeat('-', 80) . "\n";
    
    foreach ($columns as $col) {
        printf("%-25s %-30s %-10s\n", $col['Field'], $col['Type'], $col['Null']);
    }
    
    echo "\n";
    
    // Check if scheduled_for exists
    $hasScheduledFor = false;
    foreach ($columns as $col) {
        if ($col['Field'] === 'scheduled_for') {
            $hasScheduledFor = true;
            break;
        }
    }
    
    if ($hasScheduledFor) {
        echo "✓ scheduled_for column exists\n";
    } else {
        echo "✗ scheduled_for column is MISSING!\n";
        echo "\nThis is why posts aren't showing - the migration hasn't been applied!\n";
        echo "Run the migration: mysql -u root -p joblink < database/migrations/0003_create_feed_tables.sql\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
