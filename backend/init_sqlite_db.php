<?php
/**
 * Initialize SQLite Database
 * This script creates all necessary tables for JobLink
 */

echo "=== Initializing SQLite Database ===\n\n";

// Create database connection
$dbPath = __DIR__ . '/storage/database.sqlite';

if (!file_exists($dbPath)) {
    echo "❌ Database file not found: $dbPath\n";
    exit(1);
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to SQLite database\n";
    echo "   Path: $dbPath\n\n";
    
    // Read and execute master schema
    $schemaFile = __DIR__ . '/database/migrations/0000_master_schema.sql';
    
    if (!file_exists($schemaFile)) {
        echo "❌ Schema file not found: $schemaFile\n";
        exit(1);
    }
    
    echo "📄 Reading schema file...\n";
    $schema = file_get_contents($schemaFile);
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    echo "📝 Executing " . count($statements) . " SQL statements...\n\n";
    
    $count = 0;
    foreach ($statements as $statement) {
        if (empty($statement)) {
            continue;
        }
        
        // Skip MySQL-specific statements
        if (strpos($statement, 'SET FOREIGN_KEY_CHECKS') !== false) {
            continue;
        }
        if (strpos($statement, 'ENGINE=InnoDB') !== false) {
            // Convert to SQLite syntax
            $statement = str_replace('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', '', $statement);
        }
        if (strpos($statement, 'COLLATE=utf8mb4_unicode_ci') !== false) {
            $statement = str_replace('COLLATE=utf8mb4_unicode_ci', '', $statement);
        }
        if (strpos($statement, 'DEFAULT CHARSET=utf8mb4') !== false) {
            $statement = str_replace('DEFAULT CHARSET=utf8mb4', '', $statement);
        }
        
        try {
            $pdo->exec($statement);
            $count++;
            echo "  ✅ Statement $count executed\n";
        } catch (PDOException $e) {
            // Some statements might fail due to SQLite limitations
            // This is okay - we just need the main tables
            echo "  ⚠️  Statement $count skipped: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✅ Database initialization complete!\n";
    echo "   Tables created: $count\n";
    echo "   Database ready for use\n\n";
    
    // Verify tables were created
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    
    echo "📊 Tables in database:\n";
    foreach ($tables as $table) {
        echo "   - $table\n";
    }
    
    echo "\n✅ SQLite database is ready!\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
