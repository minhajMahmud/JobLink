<?php
/**
 * Test Profile Update via actual API call
 */

echo "Testing Profile Update API...\n\n";

// Test data
$userId = '00000000-0000-0000-0000-000000000001';
$updateData = [
    'first_name' => 'Updated',
    'last_name' => 'Name',
    'phone' => '+880 1111111111',
    'bio' => 'Updated bio at ' . date('Y-m-d H:i:s'),
    'headline' => 'Updated Headline',
];

// Simulate API request
$url = 'http://localhost:8000/api/profile';
$headers = [
    'Content-Type: application/json',
    'x-user-id: ' . $userId,
    'x-user-role: Admin',
];

echo "Request URL: $url\n";
echo "Request Method: PUT\n";
echo "Request Headers:\n";
foreach ($headers as $header) {
    echo "  $header\n";
}
echo "\nRequest Body:\n";
echo json_encode($updateData, JSON_PRETTY_PRINT) . "\n\n";

// Initialize curl
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute
echo "Sending request...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "\n=== RESPONSE ===\n";
echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "cURL Error: $error\n";
    echo "\n✗ Request failed!\n";
    echo "\nIs the backend server running?\n";
    echo "Run: cd JobLink/backend && start-backend.bat\n";
    exit(1);
}

echo "Response Body:\n";
$responseData = json_decode($response, true);
if ($responseData) {
    echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
} else {
    echo $response . "\n";
}

echo "\n=== ANALYSIS ===\n";

if ($httpCode === 200 && isset($responseData['status']) && $responseData['status']) {
    echo "✓ Profile update successful!\n";
    
    if (isset($responseData['data'])) {
        echo "\nUpdated profile data:\n";
        echo "  Name: {$responseData['data']['name']}\n";
        echo "  Phone: {$responseData['data']['phone']}\n";
        echo "  Bio: " . substr($responseData['data']['bio'] ?? '', 0, 50) . "...\n";
    }
    
    echo "\n=================================\n";
    echo "PROFILE UPDATE: SUCCESS ✓\n";
    echo "=================================\n";
} else {
    echo "✗ Profile update failed!\n";
    
    if ($httpCode === 404) {
        echo "\nRoute not found. Possible issues:\n";
        echo "  1. Profile routes not registered\n";
        echo "  2. Backend server not running\n";
        echo "  3. Wrong URL\n";
    } elseif ($httpCode === 401) {
        echo "\nAuthentication failed.\n";
    } elseif ($httpCode === 500) {
        echo "\nServer error. Check backend logs.\n";
    }
    
    if (isset($responseData['message'])) {
        echo "\nError message: {$responseData['message']}\n";
    }
    
    if (isset($responseData['errors'])) {
        echo "\nValidation errors:\n";
        foreach ($responseData['errors'] as $field => $error) {
            echo "  - $field: $error\n";
        }
    }
}
