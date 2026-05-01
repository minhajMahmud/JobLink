<?php
declare(strict_types=1);

echo "=== Testing Frontend Requests to /feed/ ===\n\n";

$baseUrl = 'http://localhost:8000/api';
$userId = '00000000-0000-0000-0000-000000000002';
$userRole = 'seeker';
$token = 'test-token';

$tests = [
    ['GET', '/feed/', 'getFeedPosts'],
    ['POST', '/feed/posts', 'createPost'],
];

foreach ($tests as [$method, $path, $name]) {
    echo "Testing $method $path ($name)\n";
    
    $opts = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token,
                'x-user-id: ' . $userId,
                'x-user-role: ' . $userRole,
            ]),
            'ignore_errors' => true,
        ]
    ];
    
    if ($method === 'POST') {
        $body = json_encode([
            'content' => 'Test post',
            'visibility' => 'public'
        ]);
        $opts['http']['content'] = $body;
    }
    
    $context = stream_context_create($opts);
    
    try {
        $url = "$baseUrl$path";
        if ($method === 'GET') {
            $url .= "?page=1&limit=5";
        }
        
        $response = file_get_contents($url, false, $context);
        $data = json_decode($response, true);
        
        if (isset($data['error'])) {
            echo "  ✗ Error: " . $data['error'] . "\n";
        } else {
            echo "  ✓ Success: " . ($data['success'] ? 'YES' : 'NO') . "\n";
        }
    } catch (Exception $e) {
        echo "  ✗ Exception: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
