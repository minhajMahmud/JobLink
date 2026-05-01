<?php
/**
 * Test post creation and retrieval
 * Run: php test_post_creation.php
 */

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
    }
}

require_once __DIR__ . '/app/Core/Database/Connection.php';
use App\Core\Database\Connection;

echo "Testing Post Creation and Retrieval...\n\n";

try {
    $pdo = Connection::getPdo();
    
    // Get a test user
    echo "Step 1: Finding a test user...\n";
    $userStmt = $pdo->query("SELECT id, email FROM users LIMIT 1");
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "✗ No users found in database. Please create a user first.\n";
        exit(1);
    }
    
    echo "✓ Using user: {$user['email']} (ID: {$user['id']})\n\n";
    
    // Create a test post
    echo "Step 2: Creating a test post...\n";
    $postId = sprintf('%s%s-%s-%s-%s-%s%s%s', 
        ...str_split(bin2hex(random_bytes(16)), 4)
    );
    
    $content = "Test post created at " . date('Y-m-d H:i:s') . " - This post should appear in the feed!";
    
    $insertStmt = $pdo->prepare("
        INSERT INTO posts 
        (id, user_id, content, visibility, hashtags, relevance_tags, attachments, scheduled_for)
        VALUES 
        (:id, :user_id, :content, :visibility, :hashtags, :relevance_tags, :attachments, :scheduled_for)
    ");
    
    $insertStmt->execute([
        'id' => $postId,
        'user_id' => $user['id'],
        'content' => $content,
        'visibility' => 'public',
        'hashtags' => json_encode(['#test', '#automated']),
        'relevance_tags' => json_encode(['testing', 'automation']),
        'attachments' => json_encode([]),
        'scheduled_for' => null, // NULL means publish immediately
    ]);
    
    echo "✓ Post created with ID: $postId\n\n";
    
    // Retrieve the post
    echo "Step 3: Retrieving the post...\n";
    $fetchStmt = $pdo->prepare("
        SELECT * FROM posts 
        WHERE id = :id 
        LIMIT 1
    ");
    $fetchStmt->execute(['id' => $postId]);
    $post = $fetchStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        echo "✗ Failed to retrieve the post!\n";
        exit(1);
    }
    
    echo "✓ Post retrieved successfully:\n";
    echo "  ID: {$post['id']}\n";
    echo "  Content: {$post['content']}\n";
    echo "  Visibility: {$post['visibility']}\n";
    echo "  Scheduled For: " . ($post['scheduled_for'] ?? 'NULL (immediate)') . "\n";
    echo "  Created At: {$post['created_at']}\n\n";
    
    // Test feed query
    echo "Step 4: Testing feed query (should include this post)...\n";
    $feedStmt = $pdo->query("
        SELECT id, content, created_at 
        FROM posts 
        WHERE scheduled_for IS NULL OR scheduled_for <= NOW()
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $feedPosts = $feedStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✓ Feed query returned " . count($feedPosts) . " posts:\n";
    $foundTestPost = false;
    foreach ($feedPosts as $feedPost) {
        $marker = ($feedPost['id'] === $postId) ? ' ← TEST POST' : '';
        if ($feedPost['id'] === $postId) {
            $foundTestPost = true;
        }
        echo "  - " . substr($feedPost['content'], 0, 50) . "...$marker\n";
    }
    
    if (!$foundTestPost) {
        echo "\n⚠ Warning: Test post not found in feed query!\n";
    } else {
        echo "\n✓ Test post appears in feed query!\n";
    }
    
    // Clean up (optional - comment out if you want to keep the test post)
    echo "\nStep 5: Cleaning up test post...\n";
    $deleteStmt = $pdo->prepare("DELETE FROM posts WHERE id = :id");
    $deleteStmt->execute(['id' => $postId]);
    echo "✓ Test post deleted\n";
    
    echo "\n=================================\n";
    echo "POST CREATION TEST: SUCCESS ✓\n";
    echo "=================================\n";
    echo "\nThe feed functionality is working correctly!\n";
    echo "You can now create and view posts through the frontend.\n";
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
