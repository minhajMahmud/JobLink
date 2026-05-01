<?php

// Simple CORS test endpoint
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID, X-User-Role, x-user-id, x-user-role');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'message' => 'CORS is working',
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'timestamp' => date('Y-m-d H:i:s'),
]);
