<?php

require_once __DIR__ . '/bootstrap/app.php';

use App\Core\Database\Connection;
use App\Core\Http\Response;

try {
    $pdo = Connection::getPdo();
    echo "✓ Database connection successful\n";
    
    $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM users');
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo "✓ Users in database: " . $result['count'] . "\n";
    
    // Try to login
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => 'seeker@nexus.demo']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "✓ User 'seeker@nexus.demo' found\n";
        echo "  - Name: " . $user['first_name'] . " " . $user['last_name'] . "\n";
        echo "  - Role: " . $user['role'] . "\n";
        
        if (password_verify('demo1234', $user['password'])) {
            echo "✓ Password verification successful\n";
        } else {
            echo "✗ Password verification failed\n";
        }
    } else {
        echo "✗ User 'seeker@nexus.demo' not found\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
