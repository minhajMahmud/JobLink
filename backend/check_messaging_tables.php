<?php
require_once __DIR__ . '/bootstrap/app.php';
use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    sort($tables);
    echo "All tables (" . count($tables) . "):\n";
    foreach ($tables as $t) echo "  - $t\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}