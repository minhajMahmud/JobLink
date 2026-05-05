<?php
require __DIR__ . '/bootstrap/app.php';
use App\Modules\User\Repositories\UserRepository;

$repo = new UserRepository();
$stmt = $repo->pdo->query("SELECT email FROM users");
while($row = $stmt->fetch()) {
    echo $row['email'] . "\n";
}
