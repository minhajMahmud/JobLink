<?php
$pdo = new PDO(
    'mysql:host=127.0.0.1;port=3306;dbname=joblink;charset=utf8mb4',
    'root', 'root',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

echo "=== TABLES CREATED (" . date('Y-m-d H:i:s') . ") ===\n";
$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $t) echo "  $t\n";
echo "  Total: " . count($tables) . " tables\n";

echo "\n=== USERS ===\n";
foreach ($pdo->query('SELECT email, first_name, last_name, role, status FROM users')->fetchAll() as $u) {
    echo "  [{$u['role']}] {$u['first_name']} {$u['last_name']} <{$u['email']}> status={$u['status']}\n";
}

echo "\n=== CANDIDATE PROFILE ===\n";
$rows = $pdo->query('SELECT u.email, c.skills, c.experience_years, c.availability_status FROM candidates c JOIN users u ON u.id = c.user_id')->fetchAll();
foreach ($rows as $r) {
    echo "  {$r['email']} | skills={$r['skills']} | exp={$r['experience_years']}yrs | {$r['availability_status']}\n";
}

echo "\n=== EMPLOYER PROFILE ===\n";
$rows = $pdo->query('SELECT u.email, e.company_name, e.industry, e.is_verified FROM employer_profiles e JOIN users u ON u.id = e.user_id')->fetchAll();
foreach ($rows as $r) {
    $v = $r['is_verified'] ? 'yes' : 'no';
    echo "  {$r['email']} | {$r['company_name']} | {$r['industry']} | verified=$v\n";
}

echo "\n=== ADMIN PROFILE ===\n";
$rows = $pdo->query('SELECT u.email, a.access_level, a.department FROM admin_profiles a JOIN users u ON u.id = a.user_id')->fetchAll();
foreach ($rows as $r) {
    echo "  {$r['email']} | {$r['access_level']} | {$r['department']}\n";
}

echo "\n=== LOGIN TEST ===\n";
$stmt = $pdo->prepare('SELECT password FROM users WHERE email = ?');
foreach (['admin@joblink.com'=>'Admin@1234','employer@joblink.com'=>'Employer@1234','seeker@joblink.com'=>'Seeker@1234'] as $email => $pass) {
    $stmt->execute([$email]);
    $row = $stmt->fetch();
    $ok = $row && password_verify($pass, $row['password']) ? 'PASS' : 'FAIL';
    echo "  [$ok] $email\n";
}
