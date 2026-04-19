<?php

declare(strict_types=1);

return [
    'connection' => getenv('QUEUE_CONNECTION') ?: 'redis',
    'retry_after_seconds' => 90,
];
