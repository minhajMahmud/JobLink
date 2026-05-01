<?php
/**
 * Test API post creation endpoint directly
 * This simulates what the frontend does
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

echo "Testing API Post Creation Endpoint...\n\n";

// Get a test user for authentication
require_once __DIR__ . '/app/Core/Database/Connection.php';
use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    
    // Get test user
    $userStmt = $pdo->query("SELECT id, email FROM users WHERE email = 'admin@joblink.com' LIMIT 1");
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "✗ Test user not found. Using first available user...\n";
        $userStmt = $pdo->query("SELECT id, email FROM users LIMIT 1");
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if (!$user) {
        echo "✗ No users in database. Please create a user first.\n";
        exit(1);
    }
    
    echo "Using user: {$user['email']} (ID: {$user['id']})\n\n";
    
    // Simulate the API request
    echo "Simulating POST /api/feed/posts...\n";
    
    // Set up request simulation
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/api/feed/posts';
    $_SERVER['HTTP_X_USER_ID'] = $user['id'];
    $_SERVER['HTTP_X_USER_ROLE'] = 'admin';
    
    // Create request body
    $postData = [
        'content' => 'Test post from API simulation at ' . date('Y-m-d H:i:s'),
        'visibility' => 'public',
        'hashtags' => ['#test', '#api'],
        'relevanceTags' => ['testing'],
        'attachments' => [],
    ];
    
    // Simulate JSON input
    $GLOBALS['__test_input'] = json_encode($postData);
    
    // Load the controller
    require_once __DIR__ . '/app/Core/Http/Request.php';
    require_once __DIR__ . '/app/Core/Http/Response.php';
    require_once __DIR__ . '/app/Modules/Feed/Controllers/FeedController.php';
    
    // Create request object
    $request = new App\Core\Http\Request(
        $_SERVER['REQUEST_METHOD'],
        $_SERVER['REQUEST_URI'],
        [],
        [],
        $postData,
        ['id' => $user['id'], 'role' => 'admin']
    );
    
    // Call the controller
    $controller = new App\Modules\Feed\Controllers\FeedController();
    $response = $controller->createPost($request);
    
    echo "\nAPI Response:\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n\n";
    
    if ($response['success'] ?? false) {
        echo "✓ API returned success!\n";
        
        // Verify post was saved
        if (isset($response['data']['id'])) {
            $postId = $response['data']['id'];
            echo "\nVerifying post was saved to database...\n";
            
            $checkStmt = $pdo->prepare("SELECT id, content FROM posts WHERE id = :id");
            $checkStmt->execute(['id' => $postId]);
            $savedPost = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($savedPost) {
                echo "✓ Post found in database!\n";
                echo "  ID: {$savedPost['id']}\n";
                echo "  Content: {$savedPost['content']}\n";
                
                // Clean up
                echo "\nCleaning up test post...\n";
                $pdo->prepare("DELETE FROM posts WHERE id = :id")->execute(['id' => $postId]);
                echo "✓ Test post deleted\n";
                
                echo "\n=================================\n";
                echo "API POST CREATION: SUCCESS ✓\n";
                echo "=================================\n";
            } else {
                echo "✗ Post NOT found in database!\n";
                echo "The API returned success but the post wasn't saved.\n";
                exit(1);
            }
        }
    } else {
        echo "✗ API returned failure!\n";
        echo "Message: " . ($response['message'] ?? 'Unknown error') . "\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
