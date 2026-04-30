<?php

declare(strict_types=1);

return [
    'prefix'     => '/network',
    'middleware' => ['auth'],
    'routes'     => [
        ['GET',    '/suggestions',              'NetworkController@getSuggestions'],
        ['GET',    '/connections',              'NetworkController@getConnections'],
        ['POST',   '/connect/{userId}',         'NetworkController@sendRequest'],
        ['DELETE', '/connect/{userId}',         'NetworkController@removeConnection'],
        ['PATCH',  '/connect/{userId}/accept',  'NetworkController@acceptRequest'],
    ],
];
