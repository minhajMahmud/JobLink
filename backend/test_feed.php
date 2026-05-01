<?php
/**
 * Test script to verify feed functionality
 * Run: php test_feed.php
 */

// Load environment variables from .env file
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (!getenv($key)) {
            putenv("$key=$value");
        }
    }
}

require_once __DIR__ . '/app/Core/Database/Connection.php';

use App\Core\Database\Connection;

echo "Testing Feed Functionality...\n\n";

try {
    $pdo = Connection::getPdo();
    echo "✓ Database connection successful\n\n";
    
    // Test 1: Check if posts table exists
    echo "Test 1: Checking posts table...\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'posts'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Posts table exists\n";
    } else {
        echo "✗ Posts table does not exist\n";
        exit(1);
    }
    
    // Test 2: Count total posts
    echo "\nTest 2: Counting posts...\n";
    $countStmt = $pdo->query("SELECT COUNT(*) as total FROM posts");
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "✓ Total posts in database: $total\n";
    
    // Test 3: Check recent posts
    echo "\nTest 3: Fetching recent posts...\n";
    $recentStmt = $pdo->query("
        SELECT id, user_id, content, visibility, scheduled_for, created_at 
        FROM posts 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $recentPosts = $recentStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($recentPosts) > 0) {
        echo "✓ Found " . count($recentPosts) . " recent posts:\n";
        foreach ($recentPosts as $post) {
            echo "  - ID: {$post['id']}\n";
            echo "    Content: " . substr($post['content'], 0, 50) . "...\n";
            echo "    Visibility: {$post['visibility']}\n";
            echo "    Scheduled: " . ($post['scheduled_for'] ?? 'NULL') . "\n";
            echo "    Created: {$post['created_at']}\n\n";
        }
    } else {
        echo "✗ No posts found in database\n";
    }
    
    // Test 4: Check posts with scheduled_for filter
    echo "\nTest 4: Checking posts that should appear in feed...\n";
    $feedStmt = $pdo->query("
        SELECT COUNT(*) as total 
        FROM posts 
        WHERE scheduled_for IS NULL OR scheduled_for <= NOW()
    ");
    $feedTotal = $feedStmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "✓ Posts that should appear in feed: $feedTotal\n";
    
    // Test 5: Check for posts with empty scheduled_for
    echo "\nTest 5: Checking for posts with empty string scheduled_for...\n";
    $emptyStmt = $pdo->query("
        SELECT COUNT(*) as total 
        FROM posts 
        WHERE scheduled_for = ''
    ");
    $emptyTotal = $emptyStmt->fetch(PDO::FETCH_ASSOC)['total'];
    if ($emptyTotal > 0) {
        echo "⚠ Warning: Found $emptyTotal posts with empty string scheduled_for (should be NULL)\n";
    } else {
        echo "✓ No posts with empty string scheduled_for\n";
    }
    
    // Test 6: Check users table
    echo "\nTest 6: Checking users table...\n";
    $usersStmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $usersTotal = $usersStmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "✓ Total users in database: $usersTotal\n";
    
    echo "\n=================================\n";
    echo "FEED TEST: SUCCESS ✓\n";
    echo "=================================\n";
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
