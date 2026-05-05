<?php
try {
    $db = new PDO('mysql:host=127.0.0.1;port=3306;dbname=joblink', 'root', 'root');
    foreach($db->query('SELECT id, email, first_name, last_name FROM users') as $row) {
        echo $row['id'] . " | " . $row['email'] . "\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
