<?php

declare(strict_types=1);

return [
    'name' => 'JobLink API',
    'env' => getenv('APP_ENV') ?: 'local',
    'debug' => (bool) (getenv('APP_DEBUG') ?: true),
];
