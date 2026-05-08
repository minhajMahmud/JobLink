<?php
/**
 * Diagnostic script to check feed database status
 * Run: php check-feed-database.php
 */

require_once __DIR__ . '/app/Core/Database/Connection.php';

use App\Core\Database\Connection;

echo "\n========================================\n";
echo "  Feed Database Diagnostic\n";
echo "========================================\n\n";

try {
    $pdo = Connection::getPdo();
    echo "✓ Database connection: OK\n\n";

    // Check if posts table exists
    echo "Checking tables...\n";
    $tables = $pdo->query("SHOW TABLES LIKE 'posts'")->fetchAll();
    if (empty($tables)) {
        echo "✗ ERROR: 'posts' table does NOT exist!\n";
        echo "\nSOLUTION: Run the migration:\n";
        echo "  mysql -u root -p joblink < database/migrations/0003_create_feed_tables.sql\n\n";
        exit(1);
    }
    echo "✓ 'posts' table exists\n\n";

    // Check table structure
    echo "Checking posts table structure...\n";
    $columns = $pdo->query("DESCRIBE posts")->fetchAll(PDO::FETCH_ASSOC);
    echo "Columns found: " . count($columns) . "\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
    echo "\n";

    // Count posts
    $count = $pdo->query("SELECT COUNT(*) FROM posts")->fetchColumn();
    echo "Total posts in database: $count\n\n";

    // Show recent posts
    if ($count > 0) {
        echo "Recent posts:\n";
        $stmt = $pdo->query("SELECT id, user_id, LEFT(content, 50) as content_preview, created_at FROM posts ORDER BY created_at DESC LIMIT 5");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($posts as $post) {
            echo "  - ID: {$post['id']}\n";
            echo "    User: {$post['user_id']}\n";
            echo "    Content: {$post['content_preview']}...\n";
            echo "    Created: {$post['created_at']}\n\n";
        }
    } else {
        echo "No posts found in database.\n";
        echo "Try creating a post from the frontend.\n\n";
    }

    // Check other feed tables
    echo "Checking other feed tables...\n";
    $feedTables = ['post_reactions', 'post_comments'];
    foreach ($feedTables as $table) {
        $exists = $pdo->query("SHOW TABLES LIKE '$table'")->fetchAll();
        if (empty($exists)) {
            echo "✗ '$table' table does NOT exist\n";
        } else {
            $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "✓ '$table' table exists ($count rows)\n";
        }
    }
    echo "\n";

    echo "========================================\n";
    echo "  Diagnostic Complete\n";
    echo "========================================\n\n";

} catch (Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n\n";
    exit(1);
}
