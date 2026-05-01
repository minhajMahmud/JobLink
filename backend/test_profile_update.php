<?php
declare(strict_types=1);

echo "=== Testing Profile Update API ===\n\n";

$baseUrl = 'http://localhost:8000/api';
$userId = '00000000-0000-0000-0000-000000000002';
$token = 'test-token';

$profileData = [
    'first_name' => 'Test',
    'last_name' => 'User',
    'headline' => 'Senior Test Engineer',
    'bio' => 'I am a test user updating my profile',
    'location' => 'Test City, Test Country',
    'website' => 'https://testuser.com',
    'phone' => '+1 555-0123',
    'skills' => ['PHP', 'JavaScript', 'Testing'],
    'experience_years' => 5,
    'education_level' => 'Bachelor',
    'availability_status' => 'Open to opportunities',
];

$opts = [
    'http' => [
        'method' => 'PUT',
        'header' => implode("\r\n", [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
            'x-user-id: ' . $userId,
            'x-user-role: seeker',
        ]),
        'content' => json_encode($profileData),
        'ignore_errors' => true,
    ]
];

$context = stream_context_create($opts);

echo "Making PUT request to: $baseUrl/user/profile\n";
echo "Payload: " . json_encode($profileData, JSON_PRETTY_PRINT) . "\n\n";

try {
    $response = file_get_contents("$baseUrl/user/profile", false, $context);
    $data = json_decode($response, true);
    
    if (isset($data['status'])) {
        echo "✅ Status: " . ($data['status'] ? 'SUCCESS' : 'FAILED') . "\n";
        echo "Message: " . ($data['message'] ?? '') . "\n";
        
        if ($data['status'] && isset($data['data'])) {
            echo "\nReturned data:\n";
            echo "  First Name: " . ($data['data']['first_name'] ?? '') . "\n";
            echo "  Last Name: " . ($data['data']['last_name'] ?? '') . "\n";
            echo "  Headline: " . ($data['data']['headline'] ?? '') . "\n";
            echo "  Bio: " . substr($data['data']['bio'] ?? '', 0, 50) . "...\n";
            echo "  Skills: " . implode(', ', $data['data']['skills'] ?? []) . "\n";
        }
    } else if (isset($data['error'])) {
        echo "❌ Error: " . $data['error'] . "\n";
    } else {
        echo "Response:\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}
