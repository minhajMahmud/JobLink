<?php
declare(strict_types=1);

echo "=== Testing GET /feed API ===\n\n";

$baseUrl = 'http://localhost:8000/api';
$userId = '00000000-0000-0000-0000-000000000002'; // seeker user
$userRole = 'seeker';

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => implode("\r\n", [
            'Content-Type: application/json',
            'x-user-id: ' . $userId,
            'x-user-role: ' . $userRole,
        ]),
        'ignore_errors' => true,
    ]
]);

echo "Making request to: $baseUrl/feed?page=1&limit=20\n\n";

try {
    $response = file_get_contents("$baseUrl/feed?page=1&limit=20", false, $context);
    $data = json_decode($response, true);
    
    echo "Response Status:\n";
    echo "  Success: " . ($data['success'] ? 'YES' : 'NO') . "\n";
    echo "  Message: " . ($data['message'] ?? 'N/A') . "\n\n";
    
    if ($data['success']) {
        echo "Posts returned: " . count($data['data'] ?? []) . "\n";
        if (count($data['data'] ?? []) > 0) {
            echo "\nFirst post details:\n";
            $post = $data['data'][0];
            echo "  - ID: " . $post['id'] . "\n";
            echo "  - Author: " . $post['author']['name'] . "\n";
            echo "  - Content: " . substr($post['content'], 0, 50) . "...\n";
            echo "  - Created: " . $post['createdAt'] . "\n";
            echo "  - Comments: " . count($post['comments'] ?? []) . "\n";
        }
    } else {
        echo "ERROR: " . ($data['message'] ?? 'Unknown error') . "\n";
        echo "\nFull response:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
