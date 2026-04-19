<?php

declare(strict_types=1);

return [
    'POST /auth/login' => [\App\Modules\Auth\Controllers\AuthController::class, 'login'],
];
