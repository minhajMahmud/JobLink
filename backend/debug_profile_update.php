<?php

/**
 * Debug Profile Update
 * Run this to test profile update and see detailed error messages
 */

require __DIR__ . '/bootstrap/app.php';

use App\Core\Database\Connection;
use App\Modules\User\Services\ProfileService;
use App\Modules\User\Repositories\UserRepository;

echo "=== PROFILE UPDATE DEBUG ===\n\n";

// Test with your user ID
$userId = readline("Enter user ID (or press Enter for default): ");
if (empty($userId)) {
    $userId = '00000000-0000-0000-0000-000000000003';
}

echo "Using User ID: $userId\n\n";

// Check if user exists
$pdo = Connection::getPdo();
$stmt = $pdo->prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "❌ ERROR: User not found!\n";
    echo "Please check your user ID.\n";
    exit(1);
}

echo "✓ User found:\n";
echo "  Email: {$user['email']}\n";
echo "  Name: {$user['first_name']} {$user['last_name']}\n";
echo "  Role: {$user['role']}\n\n";

// Test update
echo "Testing profile update...\n";

$profileService = new ProfileService();

$testData = [
    'first_name' => 'Updated',
    'last_name' => 'Name',
    'bio' => 'This is a test update at ' . date('Y-m-d H:i:s'),
];

echo "Update data: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

$result = $profileService->updateProfile($userId, $testData);

if ($result['success']) {
    echo "✓ SUCCESS: Profile updated!\n\n";
    
    // Fetch updated profile
    $profile = $profileService->getProfile($userId);
    echo "Updated profile:\n";
    echo "  Name: {$profile['first_name']} {$profile['last_name']}\n";
    echo "  Bio: {$profile['bio']}\n";
    echo "  Updated at: {$profile['updated_at']}\n";
} else {
    echo "❌ FAILED: {$result['message']}\n";
    if (isset($result['errors'])) {
        echo "\nValidation errors:\n";
        foreach ($result['errors'] as $field => $error) {
            echo "  - $field: $error\n";
        }
    }
}

echo "\n=== DEBUG COMPLETE ===\n";
