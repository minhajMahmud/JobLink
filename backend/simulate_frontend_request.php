<?php
/**
 * Simulate exactly what the frontend does when creating a post
 * This will help identify if the issue is in the backend or frontend
 */

echo "Simulating Frontend POST Request...\n\n";

// Simulate the exact request the frontend makes
$url = 'http://localhost:8000/api/feed/posts';
$data = [
    'content' => 'Test post from simulation at ' . date('Y-m-d H:i:s'),
    'visibility' => 'public',
    'attachments' => [],
    'hashtags' => ['#test'],
    'relevanceTags' => ['testing'],
];

echo "Request URL: $url\n";
echo "Request Data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

// Initialize curl
$ch = curl_init($url);

// Set options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-user-id: 00000000-0000-0000-0000-000000000001',
    'x-user-role: admin',
]);

// Execute request
echo "Sending request...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "\n=== RESPONSE ===\n";
echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "cURL Error: $error\n";
    echo "\n✗ Request failed!\n";
    echo "\nPossible causes:\n";
    echo "  - Backend server is not running\n";
    echo "  - Backend is running on a different port\n";
    echo "  - Firewall blocking the connection\n";
    echo "\nSolution: Make sure backend is running with start-backend.bat\n";
    exit(1);
}

echo "Response Body:\n";
$responseData = json_decode($response, true);
if ($responseData) {
    echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
} else {
    echo $response . "\n";
}

echo "\n=== ANALYSIS ===\n";

if ($httpCode === 200 && isset($responseData['success']) && $responseData['success']) {
    echo "✓ Request successful!\n";
    
    if (isset($responseData['data']['id'])) {
        $postId = $responseData['data']['id'];
        echo "✓ Post ID: $postId\n";
        
        // Verify in database
        echo "\nVerifying in database...\n";
        
        // Load environment
        if (file_exists(__DIR__ . '/.env')) {
            $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                if (strpos($line, '=') === false) continue;
                list($key, $value) = explode('=', $line, 2);
                putenv(trim($key) . '=' . trim($value));
            }
        }
        
        require_once __DIR__ . '/app/Core/Database/Connection.php';
        
        try {
            $pdo = App\Core\Database\Connection::getPdo();
            $stmt = $pdo->prepare("SELECT id, content, created_at FROM posts WHERE id = :id");
            $stmt->execute(['id' => $postId]);
            $post = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($post) {
                echo "✓ Post found in database!\n";
                echo "  Content: {$post['content']}\n";
                echo "  Created: {$post['created_at']}\n";
                
                echo "\n=================================\n";
                echo "SUCCESS! Post was saved ✓\n";
                echo "=================================\n";
                echo "\nThe backend is working correctly!\n";
                echo "If posts aren't showing in the frontend, the issue is in the frontend code.\n";
                
                // Clean up
                echo "\nCleaning up test post...\n";
                $pdo->prepare("DELETE FROM posts WHERE id = :id")->execute(['id' => $postId]);
                echo "✓ Test post deleted\n";
            } else {
                echo "✗ Post NOT found in database!\n";
                echo "\nThis means the API returned success but didn't actually save the post.\n";
                echo "Check the debug log: type debug_requests.log\n";
            }
        } catch (Exception $e) {
            echo "✗ Database error: " . $e->getMessage() . "\n";
        }
    }
} else {
    echo "✗ Request failed!\n";
    
    if ($httpCode === 401) {
        echo "\nAuthentication failed.\n";
        echo "The request was not authenticated.\n";
    } elseif ($httpCode === 404) {
        echo "\nEndpoint not found.\n";
        echo "The route /api/feed/posts doesn't exist or isn't registered.\n";
    } elseif ($httpCode === 500) {
        echo "\nServer error.\n";
        echo "Check the backend logs for PHP errors.\n";
    } else {
        echo "\nUnexpected response code: $httpCode\n";
    }
    
    if (isset($responseData['message'])) {
        echo "Error message: {$responseData['message']}\n";
    }
}

echo "\n=== DEBUG LOG ===\n";
if (file_exists(__DIR__ . '/debug_requests.log')) {
    echo file_get_contents(__DIR__ . '/debug_requests.log');
} else {
    echo "No debug log found.\n";
}
