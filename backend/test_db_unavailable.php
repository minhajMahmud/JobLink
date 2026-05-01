<?php
/**
 * Test Database Unavailable Error
 * This script demonstrates what happens when the database is unavailable
 */

echo "=== Testing Database Unavailable Scenario ===\n\n";

// Simulate database connection attempt
echo "1. Attempting to connect to database...\n";
echo "   Host: 127.0.0.1:3306\n";
echo "   Database: joblink\n";
echo "   User: root\n\n";

try {
    // Try to connect to database
    $pdo = new PDO(
        'mysql:host=127.0.0.1;port=3306;dbname=joblink',
        'root',
        'root',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]
    );
    
    echo "✅ Database connection successful!\n";
    echo "   Status: Connected\n";
    
} catch (PDOException $e) {
    echo "❌ DATABASE UNAVAILABLE\n";
    echo "   Error: " . $e->getMessage() . "\n";
    echo "   Code: " . $e->getCode() . "\n\n";
    
    echo "=== What This Means ===\n";
    echo "- MySQL server is not running\n";
    echo "- Database 'joblink' does not exist\n";
    echo "- Connection credentials are incorrect\n";
    echo "- Network connection to database failed\n\n";
    
    echo "=== API Response When Database is Unavailable ===\n";
    echo json_encode([
        'status' => false,
        'message' => 'Database unavailable',
        'error' => 'Could not connect to database',
        'debug' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";
    
    echo "=== Frontend Error Message ===\n";
    echo "User will see: 'Failed to load profile'\n";
    echo "Or: 'Unable to connect to server'\n\n";
    
    echo "=== How to Fix ===\n";
    echo "1. Start MySQL server\n";
    echo "2. Verify database 'joblink' exists\n";
    echo "3. Check .env file for correct credentials\n";
    echo "4. Verify network connection to database\n";
    echo "5. Restart backend server\n\n";
    
    exit(1);
}

echo "\n=== Database Status ===\n";
echo "✅ All systems operational\n";
echo "✅ Backend can access database\n";
echo "✅ Profile API will work correctly\n";
