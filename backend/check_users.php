<?php require 'config/database.php'; $db = (new Database())->getConnection(); $stmt = $db->query('SELECT id, email, password_hash, status FROM users'); print_r($stmt->fetchAll(PDO::FETCH_ASSOC)); ?>
