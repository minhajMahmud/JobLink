<?php
declare(strict_types=1);

// Load .env
$envFile = __DIR__ . '/.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        putenv(trim($k) . '=' . trim($v));
    }
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_DATABASE') ?: 'joblink';
$user = getenv('DB_USERNAME') ?: 'root';
$pass = getenv('DB_PASSWORD') ?: '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbName;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Check posts count
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM posts');
    $result = $stmt->fetch();
    echo "Total posts in database: " . ($result['count'] ?? 0) . "\n";

    // Fetch recent posts
    $stmt = $pdo->query('SELECT id, user_id, content, created_at FROM posts ORDER BY created_at DESC LIMIT 5');
    $posts = $stmt->fetchAll();
    
    if (!empty($posts)) {
        echo "\nRecent posts:\n";
        foreach ($posts as $post) {
            echo "  ID: {$post['id']}\n";
            echo "  User: {$post['user_id']}\n";
            echo "  Content: " . substr($post['content'], 0, 50) . "...\n";
            echo "  Created: {$post['created_at']}\n\n";
        }
    } else {
        echo "\nNo posts found in database.\n";
    }

    // Check if posts table has all columns
    echo "\nPosts table columns:\n";
    $stmt = $pdo->query('DESCRIBE posts');
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
