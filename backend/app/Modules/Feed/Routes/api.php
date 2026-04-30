<?php

declare(strict_types=1);

return [
    'prefix'     => '/feed',
    'middleware' => ['auth'],
    'routes'     => [
        ['GET',    '/',                        'FeedController@getFeed'],
        ['POST',   '/posts',                   'FeedController@createPost'],
        ['POST',   '/posts/{id}/react',        'FeedController@reactToPost'],
        ['POST',   '/posts/{id}/comment',      'FeedController@addComment'],
        ['POST',   '/posts/{id}/share',        'FeedController@sharePost'],
        ['POST',   '/posts/{id}/poll-vote',    'FeedController@votePoll'],
        ['DELETE', '/posts/{id}',              'FeedController@deletePost'],
    ],
];
