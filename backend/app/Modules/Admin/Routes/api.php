<?php

declare(strict_types=1);

return [
    'prefix' => '/admin',
    'middleware' => ['auth', 'role:admin'],
    'routes' => [
        // User management
        ['GET', '/users', 'AdminController@getUsers'],
        ['PATCH', '/users/{id}/status', 'AdminController@updateUserStatus'],
        ['DELETE', '/users/{id}', 'AdminController@deleteUser'],

        // Employer management
        ['GET', '/employers', 'AdminController@getEmployers'],
        ['PATCH', '/employers/{id}/verify', 'AdminController@verifyEmployer'],

        // Post moderation
        ['GET', '/posts', 'AdminController@getPosts'],
        ['POST', '/posts/{id}/moderate', 'AdminController@moderatePost'],

        // Job moderation
        ['GET', '/jobs', 'AdminController@getJobs'],
        ['POST', '/jobs/{id}/moderate', 'AdminController@moderateJob'],

        // Analytics
        ['GET', '/analytics', 'AdminController@getAnalytics'],

        // Report handling
        ['GET', '/reports', 'AdminController@getReports'],
        ['POST', '/reports/{id}/resolve', 'AdminController@resolveReport'],

        // Spam detection
        ['GET', '/spam-alerts', 'AdminController@getSpamAlerts'],

        // RBAC
        ['GET', '/rbac', 'AdminController@getRbacMatrix'],
    ],
];
