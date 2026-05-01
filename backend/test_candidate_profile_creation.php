<?php

/**
 * Test Candidate Profile Auto-Creation
 */

require __DIR__ . '/bootstrap/app.php';

use App\Core\Database\Connection;

$pdo = Connection::getPdo();

echo "=== TESTING CANDIDATE PROFILE AUTO-CREATION ===\n\n";

// Find candidate users
$stmt = $pdo->prepare('
    SELECT u.id, u.email, u.first_name, u.last_name, u.role, c.id as candidate_id 
    FROM users u 
    LEFT JOIN candidates c ON u.id = c.user_id 
    WHERE u.role = "Candidate" 
    LIMIT 5
');
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Candidate Users:\n";
echo str_repeat("-", 70) . "\n";

foreach ($users as $user) {
    $hasProfile = $user['candidate_id'] ? '✓ HAS profile' : '✗ NO profile';
    echo "{$user['email']} - {$hasProfile}\n";
}

// Find a user without profile
$userWithoutProfile = null;
foreach ($users as $user) {
    if (!$user['candidate_id']) {
        $userWithoutProfile = $user;
        break;
    }
}

if (!$userWithoutProfile) {
    echo "\n✓ All candidate users have profiles!\n";
    echo "\nLet's test with an existing user...\n";
    $userWithoutProfile = $users[0];
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "Testing with user: {$userWithoutProfile['email']}\n";
echo str_repeat("=", 70) . "\n\n";

// Test profile update
$userId = $userWithoutProfile['id'];

echo "Sending profile update request...\n";

$ch = curl_init('http://localhost:8000/api/profile');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-user-id: ' . $userId,
    'x-user-role: candidate',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'first_name' => 'Test',
    'last_name' => 'Candidate',
    'bio' => 'This is a test bio',
    'skills' => ['PHP', 'JavaScript', 'MySQL'],
    'experience_years' => 3,
    'education_level' => 'Bachelor',
    'salary_min' => 50000,
    'salary_max' => 80000,
    'availability_status' => 'Open to opportunities',
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Response Code: $httpCode\n";

if ($response) {
    $data = json_decode($response, true);
    
    if ($data['status']) {
        echo "✓ SUCCESS: Profile updated!\n\n";
        
        // Verify in database
        $stmt = $pdo->prepare('
            SELECT c.* 
            FROM candidates c 
            WHERE c.user_id = ?
        ');
        $stmt->execute([$userId]);
        $candidate = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($candidate) {
            echo "✓ Candidate profile found in database!\n";
            echo "\nProfile Data:\n";
            echo "  Skills: " . $candidate['skills'] . "\n";
            echo "  Experience: {$candidate['experience_years']} years\n";
            echo "  Education: {$candidate['education_level']}\n";
            echo "  Salary: \${$candidate['salary_min']} - \${$candidate['salary_max']}\n";
            echo "  Availability: {$candidate['availability_status']}\n";
            echo "\n✓ ALL DATA SAVED TO DATABASE!\n";
        } else {
            echo "✗ ERROR: Candidate profile not found in database!\n";
        }
    } else {
        echo "✗ FAILED: {$data['message']}\n";
        if (isset($data['errors'])) {
            echo "\nErrors:\n";
            foreach ($data['errors'] as $field => $error) {
                echo "  - $field: $error\n";
            }
        }
    }
} else {
    echo "✗ ERROR: No response from server\n";
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "TEST COMPLETE\n";
echo str_repeat("=", 70) . "\n";
