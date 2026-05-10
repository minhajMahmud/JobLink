<?php

declare(strict_types=1);

return [
    'prefix' => '/user',
    'middleware' => ['auth'],
    'routes' => [
        // Profile routes (new standardized endpoints)
        ['GET', '/profile', 'ProfileController@getProfile'],
        ['PUT', '/profile', 'ProfileController@updateProfile'],
        ['POST', '/profile/image', 'ProfileController@uploadImage'],
        
        // Public user view
        ['GET', '/{id}', 'UserController@show'],
        
        // Resume routes (using dedicated ResumeController)
        ['GET', '/resume', 'ResumeController@getResume'],
        ['PUT', '/resume', 'ResumeController@updateResume'],
        
        // Legacy candidate routes (for backward compatibility)
        ['GET', '/resume-legacy', 'CandidateController@getResume'],
        ['PUT', '/resume-legacy', 'CandidateController@saveResume'],
        ['GET', '/applications', 'CandidateController@getApplications'],
        ['POST', '/applications', 'CandidateController@applyToJob'],
        ['PATCH', '/applications/{id}/status', 'CandidateController@updateApplicationStatus'],
        
        // Experience routes (using dedicated ExperienceController)
        ['GET', '/experience', 'ExperienceController@getExperience'],
        ['POST', '/experience', 'ExperienceController@addExperience'],
        ['PUT', '/experience/{id}', 'ExperienceController@updateExperience'],
        ['DELETE', '/experience/{id}', 'ExperienceController@deleteExperience'],
        
        // Education routes (using dedicated EducationController)
        ['GET', '/education', 'EducationController@getEducation'],
        ['POST', '/education', 'EducationController@addEducation'],
        ['PUT', '/education/{id}', 'EducationController@updateEducation'],
        ['DELETE', '/education/{id}', 'EducationController@deleteEducation'],
        
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
        
        // Custom URL routes (using ProfileController)
        ['GET', '/custom-url', 'ProfileController@getCustomUrl'],
        ['PUT', '/custom-url', 'ProfileController@updateCustomUrl'],
    ],
];