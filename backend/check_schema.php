<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap/app.php';

$pdo = \App\Core\Database\Connection::getPdo();

echo "=== Candidates Table Columns ===\n";
$stmt = $pdo->query('DESCRIBE candidates');
$cols = $stmt->fetchAll();
foreach ($cols as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

echo "\n=== Users Table Columns ===\n";
$stmt = $pdo->query('DESCRIBE users');
$cols = $stmt->fetchAll();
foreach ($cols as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}
