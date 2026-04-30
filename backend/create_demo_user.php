<?php

require_once __DIR__ . '/bootstrap/app.php';

use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    
    // Create a demo user
    $email = 'seeker@nexus.demo';
    $password = password_hash('demo1234', PASSWORD_BCRYPT);
    $firstName = 'Demo';
    $lastName = 'Seeker';
    $role = 'Candidate';
    
    $stmt = $pdo->prepare(
        'INSERT INTO users (id, email, password, first_name, last_name, role, status, created_at, updated_at) 
         VALUES (:id, :email, :password, :first_name, :last_name, :role, :status, :created_at, :updated_at)'
    );
    
    $stmt->execute([
        ':id' => bin2hex(random_bytes(8)),
        ':email' => $email,
        ':password' => $password,
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':role' => $role,
        ':status' => 'Active',
        ':created_at' => date('Y-m-d H:i:s'),
        ':updated_at' => date('Y-m-d H:i:s'),
    ]);
    
    echo "User created successfully!\n";
    echo "Email: $email\n";
    echo "Password: demo1234\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
