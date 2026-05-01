<?php

// Initialize SQLite Database for JobLink

$dbPath = 'storage/database.sqlite';

// Create storage directory if it doesn't exist
if (!is_dir('storage')) {
    mkdir('storage', 0755, true);
}

// Create or connect to SQLite database
try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ SQLite database connected at: $dbPath\n";
    
    // Read schema file
    $schemaFile = 'database/sqlite_schema.sql';
    if (!file_exists($schemaFile)) {
        die("❌ Schema file not found: $schemaFile\n");
    }
    
    $schema = file_get_contents($schemaFile);
    
    // Split and execute statements
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    $pdo->beginTransaction();
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            try {
                $pdo->exec($statement);
                echo "✓ Executed statement\n";
            } catch (PDOException $e) {
                echo "⚠️ Warning: " . $e->getMessage() . "\n";
            }
        }
    }
    
    $pdo->commit();
    
    echo "\n✅ Database initialized successfully!\n";
    
    // Verify tables
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
    echo "\n📊 Tables created:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
    echo "\n✅ Setup complete! You can now start the backend server.\n";
    
} catch (PDOException $e) {
    die("❌ Database error: " . $e->getMessage() . "\n");
}
?>
