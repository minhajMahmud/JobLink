<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap/app.php';

$pdo = \App\Core\Database\Connection::getPdo();

echo "=== post_comments Table Columns ===\n";
$stmt = $pdo->query('DESCRIBE post_comments');
$cols = $stmt->fetchAll();
foreach ($cols as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}
