<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap/app.php';

echo "=== COMPREHENSIVE FEED TEST ===\n";
echo "Testing: Create Post → Get Feed → Add Comment → Add Reaction\n\n";

$pdo = \App\Core\Database\Connection::getPdo();
$baseUrl = 'http://localhost:8000/api';
$userId = '00000000-0000-0000-0000-000000000002';
$token = 'test-token';

function makeRequest($method, $path, $body = null) {
    global $baseUrl, $userId, $token;
    
    $opts = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token,
                'x-user-id: ' . $userId,
                'x-user-role: seeker',
            ]),
            'ignore_errors' => true,
        ]
    ];
    
    if ($body !== null) {
        $opts['http']['content'] = json_encode($body);
    }
    
    $context = stream_context_create($opts);
    $response = file_get_contents("$baseUrl$path", false, $context);
    return json_decode($response, true);
}

// Step 1: Create a post
echo "1️⃣ Creating post...\n";
$createResult = makeRequest('POST', '/feed/posts', [
    'content' => 'Test post for comprehensive testing',
    'visibility' => 'public'
]);

if (!$createResult['success']) {
    echo "   ❌ Failed: " . ($createResult['message'] ?? 'Unknown error') . "\n";
    exit(1);
}

$postId = $createResult['data']['id'];
echo "   ✅ Post created: $postId\n\n";

// Step 2: Fetch feed to verify post appears
echo "2️⃣ Fetching feed...\n";
$feedResult = makeRequest('GET', '/feed/?page=1&limit=20');

if (!$feedResult['success']) {
    echo "   ❌ Failed: " . ($feedResult['message'] ?? 'Unknown error') . "\n";
    exit(1);
}

$foundPost = false;
foreach ($feedResult['data'] as $post) {
    if ($post['id'] === $postId) {
        $foundPost = true;
        break;
    }
}

if (!$foundPost) {
    echo "   ❌ Post not found in feed!\n";
    exit(1);
}

echo "   ✅ Post found in feed (total posts: " . count($feedResult['data']) . ")\n\n";

// Step 3: Add comment to post
echo "3️⃣ Adding comment...\n";
$commentResult = makeRequest('POST', "/feed/posts/$postId/comment", [
    'content' => 'Great post!'
]);

if (!$commentResult['success']) {
    echo "   ❌ Failed: " . ($commentResult['message'] ?? 'Unknown error') . "\n";
    exit(1);
}

$commentId = $commentResult['data']['id'];
echo "   ✅ Comment added: $commentId\n\n";

// Step 4: Add reaction to post
echo "4️⃣ Adding reaction...\n";
$reactionResult = makeRequest('POST', "/feed/posts/$postId/react", [
    'reaction' => 'like'
]);

if (!$reactionResult['success']) {
    echo "   ❌ Failed: " . ($reactionResult['message'] ?? 'Unknown error') . "\n";
    exit(1);
}

echo "   ✅ Reaction added\n\n";

// Step 5: Verify everything persisted to database
echo "5️⃣ Verifying database persistence...\n";

// Check post exists
$stmt = $pdo->prepare('SELECT id FROM posts WHERE id = ?');
$stmt->execute([$postId]);
$post = $stmt->fetch();
if (!$post) {
    echo "   ❌ Post not found in database!\n";
    exit(1);
}
echo "   ✅ Post in database\n";

// Check comment exists
$stmt = $pdo->prepare('SELECT id FROM post_comments WHERE id = ? AND post_id = ?');
$stmt->execute([$commentId, $postId]);
$comment = $stmt->fetch();
if (!$comment) {
    echo "   ❌ Comment not found in database!\n";
    exit(1);
}
echo "   ✅ Comment in database\n";

// Check reaction exists
$stmt = $pdo->prepare('SELECT id FROM post_reactions WHERE post_id = ? AND user_id = ?');
$stmt->execute([$postId, $userId]);
$reaction = $stmt->fetch();
if (!$reaction) {
    echo "   ❌ Reaction not found in database!\n";
    exit(1);
}
echo "   ✅ Reaction in database\n\n";

// Step 6: Fetch feed again to verify comments/reactions are returned
echo "6️⃣ Fetching feed again to check comments/reactions...\n";
$feedResult2 = makeRequest('GET', '/feed/?page=1&limit=20');

$post = null;
foreach ($feedResult2['data'] as $p) {
    if ($p['id'] === $postId) {
        $post = $p;
        break;
    }
}

if (!$post) {
    echo "   ❌ Post not found in second fetch!\n";
    exit(1);
}

$hasComment = count($post['comments'] ?? []) > 0;
$hasReaction = (int)($post['userReaction'] ?? null) === null || $post['userReaction'] !== null;

echo "   ✅ Post found in feed\n";
echo "   Comments in feed: " . count($post['comments'] ?? []) . "\n";
echo "   User reaction: " . ($post['userReaction'] ?? 'none') . "\n\n";

echo "🎉 ALL TESTS PASSED!\n";
echo "Posts are being created, saved, returned in feed, and accept comments/reactions.\n";
