<?php

declare(strict_types=1);

return [
    'prefix' => '/jobs',
    'middleware' => ['auth'],
    'routes' => [
        ['GET', '', 'JobController@index'],
        ['GET', '/list', 'JobController@index'],
        ['GET', '/search', 'JobController@index'],
        ['GET', '/{id}', 'JobController@show'],
    ],
];
