<?php

declare(strict_types=1);

return [
    'prefix'     => '/auth',
    'middleware' => [],          // No auth required for login/register
    'routes'     => [
        ['POST', '/login',    'AuthController@login'],
        ['POST', '/register', 'AuthController@register'],
        ['GET',  '/me',       'AuthController@me'],       // auth checked in controller
        ['POST', '/logout',   'AuthController@logout'],
    ],
];
