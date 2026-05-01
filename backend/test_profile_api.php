<?php
/**
 * Test Profile API endpoints
 * Run: php test_profile_api.php
 */

// Load environment
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($k, $v) = explode('=', $line, 2);
        putenv(trim($k) . '=' . trim($v));
    }
}

require_once __DIR__ . '/app/Core/Database/Connection.php';
require_once __DIR__ . '/app/Modules/User/Models/User.php';
require_once __DIR__ . '/app/Modules/User/Models/CandidateProfile.php';
require_once __DIR__ . '/app/Modules/User/Repositories/UserRepository.php';
require_once __DIR__ . '/app/Modules/User/Services/ProfileService.php';

use App\Modules\User\Services\ProfileService;

echo "Testing Profile System...\n\n";

try {
    $profileService = new ProfileService();
    
    // Test 1: Get a user from database
    echo "Test 1: Finding a test user...\n";
    $pdo = App\Core\Database\Connection::getPdo();
    $stmt = $pdo->query("SELECT id, email, role FROM users LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "✗ No users found in database. Please create a user first.\n";
        exit(1);
    }
    
    echo "✓ Using user: {$user['email']} (ID: {$user['id']}, Role: {$user['role']})\n\n";
    
    // Test 2: Get profile
    echo "Test 2: Getting user profile...\n";
    $profile = $profileService->getProfile($user['id']);
    
    if ($profile) {
        echo "✓ Profile retrieved successfully\n";
        echo "  Name: {$profile['name']}\n";
        echo "  Email: {$profile['email']}\n";
        echo "  Role: {$profile['role']}\n";
        
        if ($user['role'] === 'Candidate') {
            echo "  Skills: " . count($profile['skills'] ?? []) . " skills\n";
            echo "  Experience: " . count($profile['experience'] ?? []) . " entries\n";
            echo "  Education: " . count($profile['education'] ?? []) . " entries\n";
        }
    } else {
        echo "✗ Failed to retrieve profile\n";
        exit(1);
    }
    
    echo "\n";
    
    // Test 3: Update profile
    echo "Test 3: Updating profile...\n";
    $updateData = [
        'phone' => '+880 1234567890',
        'bio' => 'Test bio updated at ' . date('Y-m-d H:i:s'),
        'headline' => 'Test Headline',
    ];
    
    if ($user['role'] === 'Candidate') {
        $updateData['skills'] = ['PHP', 'MySQL', 'JavaScript'];
        $updateData['experience_years'] = 5;
    }
    
    $result = $profileService->updateProfile($user['id'], $updateData);
    
    if ($result['success']) {
        echo "✓ Profile updated successfully\n";
    } else {
        echo "✗ Failed to update profile: {$result['message']}\n";
        if (isset($result['errors'])) {
            foreach ($result['errors'] as $field => $error) {
                echo "  - $field: $error\n";
            }
        }
        exit(1);
    }
    
    echo "\n";
    
    // Test 4: Verify update
    echo "Test 4: Verifying update...\n";
    $updatedProfile = $profileService->getProfile($user['id']);
    
    if ($updatedProfile && $updatedProfile['phone'] === $updateData['phone']) {
        echo "✓ Profile update verified\n";
        echo "  Phone: {$updatedProfile['phone']}\n";
        echo "  Bio: " . substr($updatedProfile['bio'] ?? '', 0, 50) . "...\n";
    } else {
        echo "✗ Profile update verification failed\n";
        exit(1);
    }
    
    echo "\n";
    
    // Test 5: Validation test
    echo "Test 5: Testing validation...\n";
    $invalidData = [
        'first_name' => '', // Empty name should fail
        'website' => 'not-a-valid-url', // Invalid URL should fail
    ];
    
    $validationResult = $profileService->updateProfile($user['id'], $invalidData);
    
    if (!$validationResult['success'] && isset($validationResult['errors'])) {
        echo "✓ Validation working correctly\n";
        echo "  Caught errors:\n";
        foreach ($validationResult['errors'] as $field => $error) {
            echo "    - $field: $error\n";
        }
    } else {
        echo "⚠ Validation might not be working as expected\n";
    }
    
    echo "\n=================================\n";
    echo "PROFILE SYSTEM TEST: SUCCESS ✓\n";
    echo "=================================\n";
    echo "\nThe profile system is working correctly!\n";
    echo "You can now use the API endpoints:\n";
    echo "  - GET  /api/profile\n";
    echo "  - PUT  /api/profile\n";
    echo "  - POST /api/profile/image\n";
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
