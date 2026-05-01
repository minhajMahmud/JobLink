<?php

require __DIR__ . '/bootstrap/app.php';

use App\Core\Database\Connection;

$userId = $argv[1] ?? '00000000-0000-0000-0000-000000000003';

$pdo = Connection::getPdo();

echo "=== VERIFYING PROFILE DATA IN DATABASE ===\n\n";
echo "User ID: $userId\n\n";

// Get user and candidate data
$stmt = $pdo->prepare('
    SELECT 
        u.first_name, u.last_name, u.email, u.bio, u.headline, u.location, u.phone, u.website,
        c.skills, c.experience_years, c.education_level, c.salary_min, c.salary_max, c.availability_status,
        u.updated_at as user_updated, c.updated_at as candidate_updated
    FROM users u 
    LEFT JOIN candidates c ON u.id = c.user_id 
    WHERE u.id = ?
');
$stmt->execute([$userId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo "ERROR: User not found!\n";
    exit(1);
}

echo "USER TABLE DATA:\n";
echo str_repeat("-", 70) . "\n";
echo "  Name: {$row['first_name']} {$row['last_name']}\n";
echo "  Email: {$row['email']}\n";
echo "  Phone: " . ($row['phone'] ?: 'Not set') . "\n";
echo "  Headline: " . ($row['headline'] ?: 'Not set') . "\n";
echo "  Location: " . ($row['location'] ?: 'Not set') . "\n";
echo "  Website: " . ($row['website'] ?: 'Not set') . "\n";
echo "  Bio: " . (substr($row['bio'] ?: 'Not set', 0, 60)) . "...\n";
echo "  Last Updated: {$row['user_updated']}\n";

echo "\nCANDIDATE TABLE DATA:\n";
echo str_repeat("-", 70) . "\n";

if ($row['skills'] !== null) {
    $skills = json_decode($row['skills'], true);
    echo "  Skills: " . implode(', ', $skills) . "\n";
    echo "  Experience: {$row['experience_years']} years\n";
    echo "  Education: {$row['education_level']}\n";
    echo "  Salary Range: \${$row['salary_min']} - \${$row['salary_max']}\n";
    echo "  Availability: {$row['availability_status']}\n";
    echo "  Last Updated: {$row['candidate_updated']}\n";
    echo "\n✓ CANDIDATE PROFILE EXISTS AND HAS DATA!\n";
} else {
    echo "  ✗ NO CANDIDATE PROFILE DATA\n";
}

echo "\n" . str_repeat("=", 70) . "\n";
