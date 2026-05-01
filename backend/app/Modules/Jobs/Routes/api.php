<?php

declare(strict_types=1);

return [
    'prefix' => '/jobs',
    'middleware' => ['auth'],
    'routes' => [
        // Job search and listing
        ['GET', '', 'JobController@index'],
        ['GET', '/search', 'JobController@index'],
        
        // Job details
        ['GET', '/{id}', 'JobController@show'],
        
        // Job application
        ['POST', '/{id}/apply', 'JobController@apply'],
        
        // Get applications for a job (recruiter only)
        ['GET', '/{id}/applications', 'JobController@getApplications'],
        
        // My applications (candidate)
        ['GET', '/my-applications', 'JobController@myApplications'],
        
        // Update application status (recruiter only)
        ['PUT', '/applications/{id}/status', 'JobController@updateApplicationStatus'],
    ],
];
