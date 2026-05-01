<?php
/**
 * Fix posts table by adding missing columns
 * Run: php fix_posts_table.php
 */

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

echo "Fixing posts table...\n\n";

try {
    $pdo = Connection::getPdo();
    
    // Check current schema
    echo "Current schema:\n";
    $stmt = $pdo->query('DESCRIBE posts');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, 'Field');
    echo "  Existing columns: " . implode(', ', $existingColumns) . "\n\n";
    
    $columnsToAdd = [];
    
    // Check for missing columns
    if (!in_array('relevance_tags', $existingColumns)) {
        $columnsToAdd[] = 'relevance_tags';
        echo "⚠ Missing column: relevance_tags\n";
    }
    
    if (!in_array('scheduled_for', $existingColumns)) {
        $columnsToAdd[] = 'scheduled_for';
        echo "⚠ Missing column: scheduled_for\n";
    }
    
    if (!in_array('funny_count', $existingColumns)) {
        $columnsToAdd[] = 'funny_count';
        echo "⚠ Missing column: funny_count\n";
    }
    
    if (empty($columnsToAdd)) {
        echo "✓ All required columns exist!\n";
        exit(0);
    }
    
    echo "\nAdding missing columns...\n";
    
    // Add relevance_tags
    if (in_array('relevance_tags', $columnsToAdd)) {
        echo "  Adding relevance_tags... ";
        $pdo->exec("ALTER TABLE posts ADD COLUMN relevance_tags JSON AFTER hashtags");
        echo "✓\n";
    }
    
    // Add scheduled_for
    if (in_array('scheduled_for', $columnsToAdd)) {
        echo "  Adding scheduled_for... ";
        $pdo->exec("ALTER TABLE posts ADD COLUMN scheduled_for TIMESTAMP NULL AFTER relevance_tags");
        echo "✓\n";
    }
    
    // Add funny_count
    if (in_array('funny_count', $columnsToAdd)) {
        echo "  Adding funny_count... ";
        $pdo->exec("ALTER TABLE posts ADD COLUMN funny_count INT UNSIGNED DEFAULT 0 AFTER support_count");
        echo "✓\n";
    }
    
    // Add index for scheduled_for if it doesn't exist
    echo "  Adding index for scheduled_for... ";
    try {
        $pdo->exec("CREATE INDEX idx_scheduled_for ON posts(scheduled_for)");
        echo "✓\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "(already exists)\n";
        } else {
            throw $e;
        }
    }
    
    echo "\n=================================\n";
    echo "POSTS TABLE FIXED ✓\n";
    echo "=================================\n";
    echo "\nYou can now create and view posts!\n";
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
