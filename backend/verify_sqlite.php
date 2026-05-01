<?php
require 'bootstrap/app.php';
require 'app/Core/Database/Connection.php';

use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    echo "SUCCESS: Connected to database using Connection::getPdo()\n";
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(', ', $tables) . "\n";
} catch (Exception $e) {
    echo "FAILURE: " . $e->getMessage() . "\n";
}
