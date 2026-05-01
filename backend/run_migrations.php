<?php

// Run all database migrations for JobLink

$host = '127.0.0.1';
$username = 'root';
$password = 'root';
$database = 'joblink';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("❌ Connection failed: " . $conn->connect_error . "\n");
    }
    
    echo "✅ Connected to MySQL database: $database\n\n";
    
    // Order of migrations
    $migrations = [
        'database/migrations/0000_master_schema.sql',
        'database/migrations/0001_create_base_tables.sql',
        'database/migrations/0002_create_candidate_profile_details.sql',
        'database/migrations/0003_create_feed_tables.sql',
        'database/migrations/0004_create_connections_notifications.sql',
        'database/migrations/0005_enhance_user_profile.sql',
    ];
    
    $total = 0;
    $success = 0;
    
    foreach ($migrations as $file) {
        if (!file_exists($file)) {
            echo "⚠️ Skipping missing: $file\n";
            continue;
        }
        
        echo "🔄 Running: $file\n";
        $sql = file_get_contents($file);
        
        // Split and execute statements
        $statements = preg_split('/;\s*\n/', $sql, -1, PREG_SPLIT_NO_EMPTY);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                $total++;
                if ($conn->query($statement)) {
                    $success++;
                } else {
                    echo "  ⚠️ Error: " . $conn->error . "\n";
                }
            }
        }
        
        echo "  ✓ Complete\n\n";
    }
    
    echo "📊 Migration Summary:\n";
    echo "  ✓ Successful: $success/$total statements\n";
    
    // Verify tables
    $result = $conn->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$database' ORDER BY TABLE_NAME");
    
    if ($result && $result->num_rows > 0) {
        echo "\n📋 Tables created:\n";
        while ($row = $result->fetch_assoc()) {
            echo "  ✓ " . $row['TABLE_NAME'] . "\n";
        }
        echo "\n✅ Database setup complete!\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    die("❌ Error: " . $e->getMessage() . "\n");
}
?>