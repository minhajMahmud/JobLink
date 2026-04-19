<?php

declare(strict_types=1);

return [
    'GET /users' => [\App\Modules\User\Controllers\UserController::class, 'index'],
];
