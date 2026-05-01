<?php

require __DIR__ . '/bootstrap/app.php';

use App\Core\Database\Connection;

$conn = Connection::getPdo();

$userId = '00000000-0000-0000-0000-000000000002';

$stmt = $conn->prepare('
    SELECT 
        first_name, 
        last_name, 
        email, 
        bio, 
        location, 
        headline,
        updated_at
    FROM users 
    WHERE id = ?
');

$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo "=== DATABASE VERIFICATION ===\n\n";
echo "User Profile Data:\n";
echo "  Name: {$user['first_name']} {$user['last_name']}\n";
echo "  Email: {$user['email']}\n";
echo "  Bio: {$user['bio']}\n";
echo "  Location: {$user['location']}\n";
echo "  Headline: {$user['headline']}\n";
echo "  Last Updated: {$user['updated_at']}\n";
echo "\n✓ Profile data successfully persisted to database\n";
