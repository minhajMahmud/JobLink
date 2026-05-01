<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap/app.php';

$pdo = \App\Core\Database\Connection::getPdo();

echo "=== Testing Comment and Reaction Endpoints ===\n\n";

// Get a test post ID from the database
$stmt = $pdo->query('SELECT id FROM posts LIMIT 1');
$post = $stmt->fetch();
if (!$post) {
    echo "ERROR: No posts in database\n";
    exit(1);
}

$postId = $post['id'];
$userId = '00000000-0000-0000-0000-000000000002';
$token = 'test-token';

echo "Using Post ID: $postId\n\n";

$baseUrl = 'http://localhost:8000/api';
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => implode("\r\n", [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
            'x-user-id: ' . $userId,
            'x-user-role: seeker',
        ]),
        'ignore_errors' => true,
    ]
]);

// Test 1: Add comment
echo "1. Testing POST /feed/posts/{id}/comment\n";
$commentPayload = json_encode(['content' => 'Great post!']);
$opts = stream_context_get_options($context);
$opts['http']['content'] = $commentPayload;
$testContext = stream_context_create($opts);

try {
    $response = file_get_contents("$baseUrl/feed/posts/$postId/comment", false, $testContext);
    $data = json_decode($response, true);
    if (isset($data['error'])) {
        echo "   ✗ Error: " . $data['error'] . "\n";
    } else if ($data['success']) {
        echo "   ✓ Comment added successfully\n";
    } else {
        echo "   ✗ Failed: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} catch (Exception $e) {
    echo "   ✗ Exception: " . $e->getMessage() . "\n";
}

// Test 2: Add reaction
echo "\n2. Testing POST /feed/posts/{id}/react\n";
$reactionPayload = json_encode(['reaction' => 'like']);
$opts = stream_context_get_options($context);
$opts['http']['content'] = $reactionPayload;
$testContext = stream_context_create($opts);

try {
    $response = file_get_contents("$baseUrl/feed/posts/$postId/react", false, $testContext);
    $data = json_decode($response, true);
    if (isset($data['error'])) {
        echo "   ✗ Error: " . $data['error'] . "\n";
    } else if ($data['success']) {
        echo "   ✓ Reaction added successfully\n";
    } else {
        echo "   ✗ Failed: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} catch (Exception $e) {
    echo "   ✗ Exception: " . $e->getMessage() . "\n";
}

// Test 3: Verify data persisted
echo "\n3. Verifying data persisted to database\n";

// Check comment
$stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM post_comments WHERE post_id = ?');
$stmt->execute([$postId]);
$commentCount = $stmt->fetch()['cnt'];
echo "   Comments in DB: $commentCount\n";

// Check reactions
$stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM post_reactions WHERE post_id = ?');
$stmt->execute([$postId]);
$reactionCount = $stmt->fetch()['cnt'];
echo "   Reactions in DB: $reactionCount\n";
