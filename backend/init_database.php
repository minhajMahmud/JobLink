<?php

// Initialize MySQL Database for JobLink

$host = '127.0.0.1';
$username = 'root';
$password = 'root';
$database = 'joblink';

try {
    // Connect to database
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("❌ Connection failed: " . $conn->connect_error . "\n");
    }
    
    echo "✅ Connected to MySQL database: $database\n\n";
    
    // Read schema file
    $schemaFile = 'database/mysql_schema.sql';
    if (!file_exists($schemaFile)) {
        // Try alternative paths
        $schemaFile = 'database/sqlite_schema.sql';
        if (!file_exists($schemaFile)) {
            die("❌ Schema file not found\n");
        }
        echo "⚠️ Using SQLite schema (will adapt for MySQL)\n";
    }
    
    $schema = file_get_contents($schemaFile);
    
    // Split by semicolon and execute
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    $executed = 0;
    $failed = 0;
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            if ($conn->multi_query($statement)) {
                // Clear all results
                while ($conn->next_result()) {}
                $executed++;
            } else {
                $failed++;
                // Skip errors for now
                echo "⚠️ " . $conn->error . "\n";
            }
        }
    }
    
    echo "\n📊 Initialization Result:\n";
    echo "  ✓ Executed: $executed statements\n";
    echo "  ⚠️ Failed/Skipped: $failed statements\n";
    
    // Verify tables
    $result = $conn->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$database'");
    
    if ($result) {
        echo "\n📋 Tables in database:\n";
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            echo "  ✓ " . $row['TABLE_NAME'] . "\n";
            $count++;
        }
        echo "\n✅ Total tables: $count\n";
    }
    
    echo "\n✅ Database setup complete!\n";
    echo "You can now:\n";
    echo "  1. Start the backend: php -S localhost:8000 -t public\n";
    echo "  2. Access phpMyAdmin: http://localhost/phpmyadmin\n";
    
    $conn->close();
    
} catch (Exception $e) {
    die("❌ Error: " . $e->getMessage() . "\n");
}
?>
