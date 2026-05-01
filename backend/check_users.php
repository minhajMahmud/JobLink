<?php

require 'app/Core/Database/Connection.php';

use App\Core\Database\Connection;

$pdo = Connection::getPdo();

// Get all users
$stmt = $pdo->query('SELECT id, email, first_name, last_name, role FROM users LIMIT 10');
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== Users in Database ===\n";
echo json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// Get all candidates
$stmt = $pdo->query('SELECT id, user_id, skills, experience_years FROM candidates LIMIT 10');
$candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== Candidates in Database ===\n";
echo json_encode($candidates, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
