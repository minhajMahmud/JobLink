<?php

// Load .env file
$envPath = __DIR__ . '/.env';
if (is_file($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }
        [$name, $value] = explode('=', $trimmed, 2);
        $name = trim($name);
        $value = trim($value);
        if ($name === '') {
            continue;
        }
        putenv($name . '=' . $value);
        $_ENV[$name] = $value;
    }
}

require 'app/Core/Database/Connection.php';
require 'app/Modules/Auth/Controllers/AuthController.php';
require 'app/Modules/User/Controllers/ProfileController.php';
require 'app/Modules/User/Services/ProfileService.php';
require 'app/Modules/User/Repositories/UserRepository.php';
require 'app/Modules/User/Models/User.php';
require 'app/Modules/User/Models/CandidateProfile.php';
require 'app/Modules/User/Models/Experience.php';
require 'app/Modules/User/Models/Education.php';
require 'app/Core/Http/Request.php';

use App\Core\Database\Connection;
use App\Modules\Auth\Controllers\AuthController;
use App\Modules\User\Controllers\ProfileController;
use App\Core\Http\Request;

echo "=== COMPLETE FLOW TEST ===\n\n";

// Step 1: Login
echo "Step 1: Login with seeker@demo.com\n";
$loginRequest = new Request(
    method: 'POST',
    path: '/api/auth/login',
    body: json_encode(['email' => 'seeker@demo.com', 'password' => 'password123']),
    headers: ['Content-Type' => 'application/json']
);

$authController = new AuthController();
$loginResponse = $authController->login($loginRequest);
echo json_encode($loginResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

if (!$loginResponse['success']) {
    echo "❌ Login failed!\n";
    exit(1);
}

$userId = $loginResponse['user']['id'];
$token = $loginResponse['token'];
echo "✅ Login successful!\n";
echo "   User ID: $userId\n";
echo "   Token: " . substr($token, 0, 20) . "...\n\n";

// Step 2: Update Profile
echo "Step 2: Update profile for user $userId\n";
$updateRequest = new Request(
    method: 'PUT',
    path: '/api/user/profile',
    body: json_encode([
        'first_name' => 'John',
        'last_name' => 'Seeker',
        'bio' => 'Updated bio from test script',
        'headline' => 'Senior Developer',
        'location' => 'San Francisco, CA',
        'phone' => '+1-555-0123',
        'website' => 'https://example.com',
        'skills' => ['React', 'Node.js', 'TypeScript'],
        'experience_years' => 5,
        'education_level' => 'Bachelor',
        'availability_status' => 'Actively looking'
    ]),
    headers: [
        'Content-Type' => 'application/json',
        'Authorization' => "Bearer $token",
        'x-user-id' => $userId,
        'x-user-role' => 'seeker'
    ]
);

// Set user on request
$updateRequest->setUser(['id' => $userId, 'role' => 'seeker']);

$profileController = new ProfileController();
$updateResponse = $profileController->updateProfile($updateRequest);
echo json_encode($updateResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

if (!$updateResponse['status']) {
    echo "❌ Profile update failed!\n";
    exit(1);
}

echo "✅ Profile updated successfully!\n\n";

// Step 3: Get Profile
echo "Step 3: Get updated profile\n";
$getRequest = new Request(
    method: 'GET',
    path: '/api/user/profile',
    headers: [
        'Authorization' => "Bearer $token",
        'x-user-id' => $userId,
        'x-user-role' => 'seeker'
    ]
);
$getRequest->setUser(['id' => $userId, 'role' => 'seeker']);

$getResponse = $profileController->getProfile($getRequest);
echo json_encode($getResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

if (!$getResponse['status']) {
    echo "❌ Profile retrieval failed!\n";
    exit(1);
}

echo "✅ Profile retrieved successfully!\n";
echo "   Name: " . $getResponse['data']['first_name'] . " " . $getResponse['data']['last_name'] . "\n";
echo "   Bio: " . $getResponse['data']['bio'] . "\n";
echo "   Headline: " . $getResponse['data']['headline'] . "\n";
echo "   Location: " . $getResponse['data']['location'] . "\n";
echo "   Phone: " . $getResponse['data']['phone'] . "\n";
echo "   Website: " . $getResponse['data']['website'] . "\n";
echo "   Skills: " . json_encode($getResponse['data']['skills']) . "\n";
echo "   Experience Years: " . $getResponse['data']['experience_years'] . "\n";
echo "   Education Level: " . $getResponse['data']['education_level'] . "\n";
echo "   Availability: " . $getResponse['data']['availability_status'] . "\n\n";

echo "=== ALL TESTS PASSED ===\n";
