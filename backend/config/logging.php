<?php

declare(strict_types=1);

return [
    'channel' => 'daily',
    'path' => __DIR__ . '/../storage/logs/app.log',
    'level' => getenv('LOG_LEVEL') ?: 'info',
];
