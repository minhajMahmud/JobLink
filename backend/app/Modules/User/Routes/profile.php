<?php

declare(strict_types=1);

// Standalone profile routes accessible at /api/profile
// Note: These routes are registered under the 'user' module in routes/api.php
// to ensure correct controller namespace resolution (App\Modules\User\Controllers\ProfileController)
return [
    'prefix' => '/profile',
    'middleware' => ['auth'],
    'routes' => [
        ['GET', '', 'ProfileController@getProfile'],
        ['PUT', '', 'ProfileController@updateProfile'],
        ['POST', '/image', 'ProfileController@uploadImage'],
    ],
];
