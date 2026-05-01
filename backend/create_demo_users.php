<?php

// Create demo users for testing JobLink

$host = '127.0.0.1';
$username = 'root';
$password = 'root';
$database = 'joblink';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error . "\n");
}

echo "✅ Connected to database\n\n";

// Demo users
$users = [
    [
        'id' => '550e8400-e29b-41d4-a716-446655440001',
        'email' => 'seeker@demo.com',
        'password' => password_hash('password123', PASSWORD_BCRYPT),
        'first_name' => 'John',
        'last_name' => 'Seeker',
        'role' => 'Candidate',
        'status' => 'Active'
    ],
    [
        'id' => '550e8400-e29b-41d4-a716-446655440002',
        'email' => 'employer@demo.com',
        'password' => password_hash('password123', PASSWORD_BCRYPT),
        'first_name' => 'Jane',
        'last_name' => 'Employer',
        'role' => 'Recruiter',
        'status' => 'Active'
    ],
    [
        'id' => '550e8400-e29b-41d4-a716-446655440003',
        'email' => 'admin@demo.com',
        'password' => password_hash('password123', PASSWORD_BCRYPT),
        'first_name' => 'Admin',
        'last_name' => 'User',
        'role' => 'Admin',
        'status' => 'Active'
    ]
];

foreach ($users as $user) {
    $sql = "INSERT INTO users (id, email, password, first_name, last_name, role, status) 
            VALUES ('{$user['id']}', '{$user['email']}', '{$user['password']}', '{$user['first_name']}', '{$user['last_name']}', '{$user['role']}', '{$user['status']}')";
    
    if ($conn->query($sql)) {
        echo "✓ Created: {$user['email']} ({$user['role']})\n";
    } else {
        echo "⚠️ Error: " . $conn->error . "\n";
    }
}

echo "\n✅ Demo users created!\n\n";
echo "Test Credentials:\n";
echo "  Candidate: seeker@demo.com / password123\n";
echo "  Recruiter: employer@demo.com / password123\n";
echo "  Admin: admin@demo.com / password123\n";

$conn->close();
?>
