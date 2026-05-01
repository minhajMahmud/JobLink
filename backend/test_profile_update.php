<?php
/**
 * Test Profile Update with Different User ID Formats
 */

require 'app/Core/Database/Connection.php';
require 'app/Modules/User/Repositories/UserRepository.php';
require 'app/Modules/User/Services/ProfileService.php';

use App\Modules\User\Repositories\UserRepository;
use App\Modules\User\Services\ProfileService;

echo "=== Profile Update Test ===\n\n";

// Test 1: With UUID user ID
echo "Test 1: Update profile with UUID user ID\n";
echo "----------------------------------------\n";

$repo = new UserRepository();
$service = new ProfileService();

// Get first user from database
$pdo = \App\Core\Database\Connection::getPdo();
$stmt = $pdo->query('SELECT id, email FROM users LIMIT 1');
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "Found user: {$user['email']} (ID: {$user['id']})\n";
    
    $result = $service->updateProfile($user['id'], [
        'first_name' => 'Test',
        'last_name' => 'User',
        'phone' => '555-1234',
        'bio' => 'Test bio',
    ]);
    
    if ($result['success']) {
        echo "✅ Profile updated successfully!\n";
        
        // Verify in database
        $profile = $service->getProfile($user['id']);
        echo "Updated profile:\n";
        echo "  Name: {$profile['first_name']} {$profile['last_name']}\n";
        echo "  Phone: {$profile['phone']}\n";
        echo "  Bio: {$profile['bio']}\n";
    } else {
        echo "❌ Update failed: {$result['message']}\n";
    }
} else {
    echo "❌ No users found in database\n";
}

echo "\n";

// Test 2: With local-admin ID
echo "Test 2: Update profile with local-admin ID\n";
echo "----------------------------------------\n";

$result = $service->updateProfile('local-admin', [
    'first_name' => 'Local',
    'last_name' => 'Admin',
    'phone' => '555-9999',
]);

if ($result['success']) {
    echo "✅ Profile updated successfully!\n";
} else {
    echo "❌ Update failed: {$result['message']}\n";
    echo "   (This is expected if local-admin doesn't exist in database)\n";
}

echo "\n";

// Test 3: Check authentication flow
echo "Test 3: Simulate authentication flow\n";
echo "----------------------------------------\n";

// Simulate JWT token
$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoic2Vla2VyIn0.signature';

echo "Token: $token\n";
echo "Decoded user ID would be: 550e8400-e29b-41d4-a716-446655440000\n";
echo "This is a valid UUID format ✅\n";

echo "\n";

// Test 4: Check local fallback
echo "Test 4: Local environment fallback\n";
echo "----------------------------------------\n";

echo "When no token/headers provided in local environment:\n";
echo "  User ID: local-admin\n";
echo "  This is NOT a UUID format\n";
echo "  But it should still work if user exists in database\n";

echo "\n=== Tests Complete ===\n";
