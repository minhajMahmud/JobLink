<?php
$userId = '550e8400-e29b-41d4-a716-446655440003';

// Test conversations endpoint
$url = 'http://localhost:8000/api/messaging/conversations';
$opts = [
    'http' => [
        'method' => 'GET',
        'header' => "x-user-id: $userId\r\nx-user-role: admin\r\n",
    ]
];

echo "Testing GET /api/messaging/conversations\n";
$result = @file_get_contents($url, false, stream_context_create($opts));
if ($result === false) {
    echo "  ✗ Error: " . error_get_last()['message'] . "\n";
} else {
    $data = json_decode($result, true);
    echo "  ✓ Response: " . ($data['success'] ? 'SUCCESS' : 'FAILED') . "\n";
    echo "  Conversations: " . ($data['count'] ?? 0) . "\n";
    if (!empty($data['conversations'])) {
        echo "  First: " . json_encode($data['conversations'][0]) . "\n";
    }
}

echo "\n";

// Test send message
echo "Testing POST /api/messaging/send\n";
$body = json_encode([
    'recipient_id' => '550e8400-e29b-41d4-a716-446655440000',
    'content' => 'Hello from test!',
    'message_type' => 'text'
]);
$opts['http']['method'] = 'POST';
$opts['http']['header'] = "x-user-id: $userId\r\nx-user-role: admin\r\nContent-Type: application/json\r\n";
$opts['http']['content'] = $body;

$result = @file_get_contents($url . '/../send', false, stream_context_create($opts));
if ($result === false) {
    echo "  ✗ Error: " . error_get_last()['message'] . "\n";
} else {
    $data = json_decode($result, true);
    echo "  ✓ Response: " . ($data['success'] ? 'SUCCESS' : 'FAILED') . "\n";
    echo "  " . ($data['message'] ?? json_encode($data)) . "\n";
}