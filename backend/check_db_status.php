<?php

// Quick Database Status Check

echo "📊 Database Availability Status\n";
echo "================================\n\n";

$host = '127.0.0.1';
$username = 'root';
$password = 'root';
$database = 'joblink';

// Try connecting
try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        echo "❌ CONNECTION ERROR: " . $conn->connect_error . "\n";
        exit(1);
    }
    
    echo "✅ MySQL Connection: SUCCESS\n";
    echo "   Host: $host:3306\n";
    echo "   Database: $database\n\n";
    
    // Check tables
    $result = $conn->query("SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$database'");
    $row = $result->fetch_assoc();
    
    echo "📋 Database Status:\n";
    echo "   Tables: " . $row['count'] . "\n\n";
    
    // Check users
    $result = $conn->query("SELECT COUNT(*) as count FROM users");
    $row = $result->fetch_assoc();
    echo "👥 Users:\n";
    echo "   Total: " . $row['count'] . "\n\n";
    
    // List users
    $result = $conn->query("SELECT id, email, role, created_at FROM users LIMIT 5");
    echo "   Recent Users:\n";
    while ($user = $result->fetch_assoc()) {
        echo "   - {$user['email']} ({$user['role']})\n";
    }
    
    echo "\n✅ DATABASE AVAILABLE - Everything is working!\n";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
