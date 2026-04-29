<?php

declare(strict_types=1);

return [
    'prefix' => '/user',
    'middleware' => ['auth'],
    'routes' => [
        ['GET', '/profile', 'CandidateController@getProfile'],
        ['PUT', '/profile', 'CandidateController@saveProfile'],
        ['GET', '/resume', 'CandidateController@getResume'],
        ['PUT', '/resume', 'CandidateController@saveResume'],
        ['GET', '/applications', 'CandidateController@getApplications'],
        ['POST', '/applications', 'CandidateController@applyToJob'],
        ['PATCH', '/applications/{id}/status', 'CandidateController@updateApplicationStatus'],
    ],
];
