<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap/app.php';
use App\Core\Database\Connection;

echo "Running Messaging Tables Migration...\n\n";

try {
    $pdo = Connection::getPdo();
    
    $sql = file_get_contents(__DIR__ . '/database/migrations/2026_04_create_messaging_tables.sql');
    
    // Split by CREATE TABLE statements for better error handling
    $statements = explode('CREATE TABLE IF NOT EXISTS', $sql);
    
    foreach ($statements as $i => $stmt) {
        $stmt = trim($stmt);
        if (empty($stmt)) continue;
        
        $fullStmt = ($i === 0 ? '' : 'CREATE TABLE IF NOT EXISTS ') . $stmt;
        $fullStmt = trim($fullStmt);
        
        try {
            $pdo->exec($fullStmt);
            // Extract table name
            preg_match('/`?(\w+)`?\s*\(/', $fullStmt, $matches);
            $tableName = $matches[1] ?? 'unknown';
            echo "  ✓ Created table: $tableName\n";
        } catch (Exception $e) {
            echo "  ✗ Error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✅ Messaging migration completed!\n";
    
    // Verify tables
    echo "\nVerifying tables...\n";
    $tables = ['conversations', 'messages', 'message_statuses', 'attachments', 'user_online_status', 'typing_status', 'blocked_users'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        $exists = $stmt->fetch();
        echo "  " . ($exists ? "✓" : "✗") . " $table\n";
    }
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}