<?php
require_once __DIR__ . '/app/Core/Database/Connection.php';

use App\Core\Database\Connection;

try {
    $pdo = Connection::getPdo();
    
    echo "Testing Company Profile System\n";
    echo "==============================\n\n";
    
    // Get employer user
    $stmt = $pdo->query("SELECT id, email, first_name, last_name FROM users WHERE role = 'Recruiter' LIMIT 1");
    $employer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$employer) {
        echo "✗ No employer user found\n";
        exit(1);
    }
    
    $employerName = trim($employer['first_name'] . ' ' . $employer['last_name']);
    echo "✓ Found employer: {$employerName} ({$employer['email']})\n";
    
    // Check if company exists
    $stmt = $pdo->prepare("SELECT * FROM companies WHERE user_id = :user_id");
    $stmt->execute(['user_id' => $employer['id']]);
    $company = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($company) {
        echo "✓ Company exists: {$company['name']}\n";
        echo "\nCompany Details:\n";
        echo "  - Industry: " . ($company['industry'] ?? 'Not set') . "\n";
        echo "  - Size: " . ($company['size'] ?? 'Not set') . "\n";
        echo "  - Headquarters: " . ($company['headquarters'] ?? 'Not set') . "\n";
        echo "  - Mission: " . ($company['mission'] ?? 'Not set') . "\n";
        echo "  - Founded: " . ($company['founded_year'] ?? 'Not set') . "\n";
        echo "  - Website: " . ($company['website'] ?? 'Not set') . "\n";
    } else {
        echo "ℹ No company profile yet (will be created on first access)\n";
    }
    
    // Verify table structure
    $stmt = $pdo->query("DESCRIBE companies");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $requiredColumns = ['mission', 'founded_year', 'description', 'culture', 'benefits'];
    $missingColumns = array_diff($requiredColumns, $columns);
    
    if (empty($missingColumns)) {
        echo "\n✓ All required columns exist in companies table\n";
    } else {
        echo "\n✗ Missing columns: " . implode(', ', $missingColumns) . "\n";
    }
    
    echo "\n✓ Company profile system is ready!\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
