<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=joblink;charset=utf8mb4', 'root', 'root', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$stmt = $pdo->query('SELECT id, email, role, status FROM users LIMIT 5');
$rows = $stmt->fetchAll();
if (empty($rows)) {
    echo "No users found - database is empty\n";
    echo "You need to register a new account first!\n";
} else {
    echo "Users in database:\n";
    foreach ($rows as $r) {
        echo "  " . $r['email'] . " | " . $r['role'] . " | " . $r['status'] . "\n";
    }
}