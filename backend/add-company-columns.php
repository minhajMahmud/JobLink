<?php
require_once __DIR__ . '/app/Core/Database/Connection.php';

use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    
    echo "Adding mission and founded_year columns...\n";
    
    // Check if columns exist first
    $stmt = $pdo->query('DESCRIBE companies');
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('mission', $columns)) {
        echo "Adding mission column...\n";
        $pdo->exec('ALTER TABLE companies ADD COLUMN mission TEXT NULL AFTER description');
        echo "✓ mission column added\n";
    } else {
        echo "ℹ mission column already exists\n";
    }
    
    if (!in_array('founded_year', $columns)) {
        echo "Adding founded_year column...\n";
        $pdo->exec('ALTER TABLE companies ADD COLUMN founded_year YEAR NULL AFTER mission');
        echo "✓ founded_year column added\n";
    } else {
        echo "ℹ founded_year column already exists\n";
    }
    
    echo "\n✓ Migration complete!\n";
    
    // Verify
    $stmt = $pdo->query('DESCRIBE companies');
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('mission', $columns) && in_array('founded_year', $columns)) {
        echo "✓ Verified: Both columns exist\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
