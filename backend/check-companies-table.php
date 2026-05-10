<?php
require_once __DIR__ . '/app/Core/Database/Connection.php';

use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    $stmt = $pdo->query('DESCRIBE companies');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Companies table columns:\n";
    echo "========================\n";
    foreach ($columns as $col) {
        echo $col['Field'] . " - " . $col['Type'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
