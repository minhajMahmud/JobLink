<?php
require_once __DIR__ . '/app/Core/Database/Connection.php';

use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    
    echo "Running company profile migration...\n";
    
    $sql = file_get_contents(__DIR__ . '/database/migrations/0006_add_company_profile_fields.sql');
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue;
        }
        $pdo->exec($statement);
        echo "✓ Executed statement\n";
    }
    
    echo "\n✓ Migration completed successfully!\n";
    
    // Verify the columns were added
    $stmt = $pdo->query('DESCRIBE companies');
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('mission', $columns) && in_array('founded_year', $columns)) {
        echo "✓ Verified: mission and founded_year columns added\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
