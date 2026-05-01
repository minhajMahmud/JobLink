<?php
declare(strict_types=1);

// Load .env
$envFile = __DIR__ . '/.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        putenv(trim($k) . '=' . trim($v));
    }
}

// Load the PHP app
require_once __DIR__ . '/bootstrap/app.php';

// Test creating a post
$pdo = \App\Core\Database\Connection::getPdo();

// Get a test user ID
$stmt = $pdo->query('SELECT id FROM users LIMIT 1');
$user = $stmt->fetch();
$userId = $user['id'] ?? null;

if (!$userId) {
    echo "ERROR: No users found in database\n";
    exit(1);
}

echo "Testing POST creation with user ID: $userId\n\n";

// Create a test post
$postId = bin2hex(random_bytes(8));
$content = "Test post created at " . date('Y-m-d H:i:s');
$hashtags = json_encode(['#test', '#api']);

$insertStmt = $pdo->prepare(
    'INSERT INTO posts (id, user_id, content, visibility, hashtags)
     VALUES (:id, :user_id, :content, :visibility, :hashtags)'
);

try {
    $insertStmt->execute([
        'id' => $postId,
        'user_id' => $userId,
        'content' => $content,
        'visibility' => 'public',
        'hashtags' => $hashtags,
    ]);
    echo "✓ Post inserted with ID: $postId\n";
} catch (Exception $e) {
    echo "✗ Failed to insert post: " . $e->getMessage() . "\n";
    exit(1);
}

// Verify the post was saved
$fetchStmt = $pdo->prepare('SELECT * FROM posts WHERE id = :id');
$fetchStmt->execute(['id' => $postId]);
$post = $fetchStmt->fetch();

if ($post) {
    echo "✓ Post verified in database:\n";
    echo "  - ID: {$post['id']}\n";
    echo "  - User ID: {$post['user_id']}\n";
    echo "  - Content: {$post['content']}\n";
    echo "  - Created: {$post['created_at']}\n";
} else {
    echo "✗ Post NOT found in database after insert!\n";
    exit(1);
}

// Check total posts
$countStmt = $pdo->query('SELECT COUNT(*) as count FROM posts');
$countResult = $countStmt->fetch();
echo "\n✓ Total posts in database: " . $countResult['count'] . "\n";
