<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap/app.php';

$pdo = \App\Core\Database\Connection::getPdo();

echo "=== post_reactions Table Columns ===\n";
$stmt = $pdo->query('DESCRIBE post_reactions');
$cols = $stmt->fetchAll();
foreach ($cols as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

echo "\n=== Checking if there are any comment_id columns ===\n";
$stmt = $pdo->query("SHOW COLUMNS FROM post_reactions LIKE '%comment%'");
$results = $stmt->fetchAll();
echo "  Found: " . count($results) . "\n";
