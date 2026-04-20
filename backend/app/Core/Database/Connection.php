<?php

declare(strict_types=1);

namespace App\Core\Database;

use PDO;
use PDOException;

final class Connection
{
    private static ?PDO $pdo = null;

    public static function getPdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        /** @var array<string, string> $config */
        $config = require __DIR__ . '/../../../config/database.php';

        $driver = strtolower((string)($config['driver'] ?? 'mysql'));
        $host = (string)($config['host'] ?? '127.0.0.1');
        $port = (string)($config['port'] ?? '3306');
        $database = (string)($config['database'] ?? 'joblink');
        $username = (string)($config['username'] ?? 'root');
        $password = (string)($config['password'] ?? '');

        $dsn = match ($driver) {
            'mysql' => sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $database),
            default => throw new PDOException(sprintf('Unsupported DB driver: %s', $driver)),
        };

        self::$pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return self::$pdo;
    }
}
