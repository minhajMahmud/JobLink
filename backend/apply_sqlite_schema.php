<?php
$dbPath = __DIR__ . '/storage/database.sqlite';
$schemaPath = __DIR__ . '/database/sqlite_schema.sql';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = file_get_contents($schemaPath);
    // SQLite's exec() only executes the first statement if they are separated by semicolons in some versions,
    // but usually it works. Let's try to split them to be safe.
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            $pdo->exec($stmt);
        }
    }
    
    echo "Schema and seed data applied successfully to $dbPath\n";
    
    // Verify users
    $stmt = $pdo->query("SELECT email FROM users");
    $emails = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Users: " . implode(', ', $emails) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
