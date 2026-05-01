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

use App\Core\Database\Connection;

$pdo = Connection::getPdo();

echo "=== DATABASE DIAGNOSTIC ===\n\n";

// Get all users
echo "1. All Users in Database:\n";
$stmt = $pdo->query('SELECT id, email, first_name, last_name, role, created_at FROM users');
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// Get all candidates
echo "2. All Candidates in Database:\n";
$stmt = $pdo->query('SELECT id, user_id, skills, experience_years, education_level FROM candidates');
$candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($candidates, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// Check if there's a mismatch between users and candidates
echo "3. User-Candidate Relationship Check:\n";
$stmt = $pdo->query('
    SELECT 
        u.id as user_id, 
        u.email, 
        u.role,
        c.id as candidate_id,
        c.user_id as candidate_user_id
    FROM users u
    LEFT JOIN candidates c ON u.id = c.user_id
');
$relationships = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($relationships, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// Check for orphaned candidates (candidates without matching users)
echo "4. Orphaned Candidates (no matching user):\n";
$stmt = $pdo->query('
    SELECT c.id, c.user_id 
    FROM candidates c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE u.id IS NULL
');
$orphaned = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($orphaned, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

echo "=== END DIAGNOSTIC ===\n";
