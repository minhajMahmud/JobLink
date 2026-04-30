<?php

declare(strict_types=1);

return [
    'prefix'     => '/notifications',
    'middleware' => ['auth'],
    'routes'     => [
        ['GET',    '/',              'NotificationsController@index'],
        ['POST',   '/',              'NotificationsController@create'],
        ['PATCH',  '/read-all',      'NotificationsController@markAllRead'],
        ['PATCH',  '/{id}/read',     'NotificationsController@markRead'],
        ['DELETE', '/',              'NotificationsController@clearAll'],
    ],
];
