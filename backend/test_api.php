<?php
declare(strict_types=1);

// Test the API endpoints using file_get_contents
echo "=== Testing JobLink Feed API ===\n\n";

$baseUrl = 'http://localhost:8000/api';
$userId = '00000000-0000-0000-0000-000000000002'; // seeker user
$userRole = 'seeker';

function makeRequest($method, $url, $data = null, $userId, $userRole) {
    $headers = [
        'Content-Type: application/json',
        'x-user-id: ' . $userId,
        'x-user-role: ' . $userRole,
    ];
    
    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $data ? json_encode($data) : null,
            'ignore_errors' => true,
        ]
    ]);
    
    try {
        $response = file_get_contents($url, false, $context);
        $httpCode = substr($http_response_header[0] ?? '', -3);
        return [
            'code' => (int)$httpCode,
            'data' => json_decode($response, true),
            'raw' => $response,
        ];
    } catch (Exception $e) {
        return [
            'error' => $e->getMessage(),
        ];
    }
}

// Test 1: Get feed
echo "1. Testing GET /feed\n";
$result = makeRequest('GET', "$baseUrl/feed?page=1&limit=20", null, $userId, $userRole);
if (isset($result['error'])) {
    echo "   ERROR: " . $result['error'] . "\n";
} else {
    echo "   HTTP Code: " . $result['code'] . "\n";
    echo "   Success: " . ($result['data']['success'] ? 'YES' : 'NO') . "\n";
    echo "   Posts: " . count($result['data']['data'] ?? []) . "\n";
    if (!$result['data']['success']) {
        echo "   Message: " . ($result['data']['message'] ?? 'N/A') . "\n";
    }
}
echo "\n";

// Test 2: Create a new post
echo "2. Testing POST /feed/posts\n";
$postContent = "Test API post at " . date('Y-m-d H:i:s');
$postPayload = [
    'content' => $postContent,
    'visibility' => 'public',
    'attachments' => [],
    'hashtags' => ['#api', '#test'],
    'relevanceTags' => ['Testing'],
];

$result = makeRequest('POST', "$baseUrl/feed/posts", $postPayload, $userId, $userRole);
if (isset($result['error'])) {
    echo "   ERROR: " . $result['error'] . "\n";
} else {
    echo "   HTTP Code: " . $result['code'] . "\n";
    echo "   Success: " . ($result['data']['success'] ? 'YES' : 'NO') . "\n";
    if ($result['data']['data'] ?? null) {
        echo "   Post ID: " . $result['data']['data']['id'] . "\n";
        echo "   Author: " . $result['data']['data']['author']['name'] . "\n";
    }
    if (!$result['data']['success']) {
        echo "   Message: " . ($result['data']['message'] ?? 'N/A') . "\n";
    }
}
echo "\n";

// Test 3: Check debug log
echo "=== Debug Log ===\n";
$logFile = __DIR__ . '/debug_requests.log';
if (is_file($logFile)) {
    $log = file_get_contents($logFile);
    if (trim($log)) {
        echo $log;
    } else {
        echo "(empty)\n";
    }
} else {
    echo "No debug log found\n";
}

// Test 4: Check database directly
echo "\n=== Database Check ===\n";
require_once __DIR__ . '/bootstrap/app.php';
$pdo = \App\Core\Database\Connection::getPdo();
$stmt = $pdo->query('SELECT COUNT(*) as count FROM posts');
$result = $stmt->fetch();
echo "Total posts in database: " . $result['count'] . "\n";

$stmt = $pdo->query('SELECT id, user_id, content, created_at FROM posts ORDER BY created_at DESC LIMIT 3');
$posts = $stmt->fetchAll();
echo "Recent posts:\n";
foreach ($posts as $post) {
    echo "  - " . substr($post['content'], 0, 40) . "... (" . $post['created_at'] . ")\n";
}
