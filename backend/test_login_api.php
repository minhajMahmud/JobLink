<?php

$data = json_encode([
    'email' => 'seeker@nexus.demo',
    'password' => 'demo1234'
]);

$url = 'http://localhost:8000/api/auth/login';

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $data
    ]
]);

try {
    $response = @file_get_contents($url, false, $context);
    echo "Response: " . $response . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
