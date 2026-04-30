<?php

$data = json_encode([
    'email' => 'seeker@nexus.demo',
    'password' => 'demo1234',
    'first_name' => 'Demo',
    'last_name' => 'Seeker',
    'role' => 'seeker'
]);

$ch = curl_init('http://localhost:8000/api/auth/register');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
