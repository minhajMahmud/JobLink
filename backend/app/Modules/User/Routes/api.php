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
        
        // Experience routes
        ['POST', '/experience', 'CandidateController@addExperience'],
        ['PUT', '/experience/{id}', 'CandidateController@updateExperience'],
        ['DELETE', '/experience/{id}', 'CandidateController@deleteExperience'],
        
        // Education routes
        ['POST', '/education', 'CandidateController@addEducation'],
        ['PUT', '/education/{id}', 'CandidateController@updateEducation'],
        ['DELETE', '/education/{id}', 'CandidateController@deleteEducation'],
        
        // Projects routes
        ['POST', '/projects', 'CandidateController@addProject'],
        ['PUT', '/projects/{id}', 'CandidateController@updateProject'],
        ['DELETE', '/projects/{id}', 'CandidateController@deleteProject'],
        
        // Publications routes
        ['POST', '/publications', 'CandidateController@addPublication'],
        ['PUT', '/publications/{id}', 'CandidateController@updatePublication'],
        ['DELETE', '/publications/{id}', 'CandidateController@deletePublication'],
        
        // Certifications routes
        ['POST', '/certifications', 'CandidateController@addCertification'],
        ['PUT', '/certifications/{id}', 'CandidateController@updateCertification'],
        ['DELETE', '/certifications/{id}', 'CandidateController@deleteCertification'],
        
        // Skills routes
        ['POST', '/skills/endorse', 'CandidateController@endorseSkill'],
        ['GET', '/skills/endorsements', 'CandidateController@getSkillEndorsements'],
    ],
];
