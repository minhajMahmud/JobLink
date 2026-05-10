<?php

declare(strict_types=1);

return [
    'driver' => ($_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER')) ?: 'mysql',
    'host' => ($_ENV['DB_HOST'] ?? getenv('DB_HOST')) ?: '127.0.0.1',
    'port' => ($_ENV['DB_PORT'] ?? getenv('DB_PORT')) ?: '3306',
    'database' => ($_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE')) ?: 'joblink',
    'username' => ($_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME')) ?: 'root',
    'password' => ($_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD')) ?: '',
];