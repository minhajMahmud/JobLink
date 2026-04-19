<?php

declare(strict_types=1);

return [
    'GET /jobs' => [\App\Modules\Jobs\Controllers\JobController::class, 'index'],
];
