<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/app.php';

echo json_encode([
    'service' => 'JobLink API',
    'status' => 'ok',
    'timestamp' => date(DATE_ATOM),
]);
