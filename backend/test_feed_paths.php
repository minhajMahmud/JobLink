<?php
declare(strict_types=1);

echo "=== Testing GET /feed API Endpoints ===\n\n";

$baseUrl = 'http://localhost:8000/api';
$userId = '00000000-0000-0000-0000-000000000002';
$userRole = 'seeker';

$paths = [
    '/feed',
    '/feed/',
];

foreach ($paths as $testPath) {
    echo "Testing: $baseUrl$testPath\n";
    
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
    
    try {
        $response = file_get_contents("$baseUrl$testPath?page=1&limit=20", false, $context);
        $data = json_decode($response, true);
        
        if (isset($data['success'])) {
            echo "  ✓ Success: " . ($data['success'] ? 'YES' : 'NO') . "\n";
            if ($data['success']) {
                echo "    Posts: " . count($data['data'] ?? []) . "\n";
            } else {
                echo "    Message: " . ($data['message'] ?? '') . "\n";
            }
        } else {
            echo "  ✗ Error: " . ($data['error'] ?? 'Unknown') . "\n";
        }
    } catch (Exception $e) {
        echo "  ✗ Exception: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
