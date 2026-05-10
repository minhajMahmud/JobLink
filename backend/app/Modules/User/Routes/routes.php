<?php

declare(strict_types=1);

use App\Modules\User\Controllers\ProfileController;
use App\Modules\User\Controllers\ExperienceController;
use App\Modules\User\Controllers\EducationController;
use App\Modules\User\Controllers\ResumeController;

return [
    // Profile endpoints
    ['GET', '/api/user/profile', [ProfileController::class, 'getProfile']],
    ['PUT', '/api/user/profile', [ProfileController::class, 'updateProfile']],
    ['GET', '/api/user/custom-url', [ProfileController::class, 'getCustomUrl']],
    ['PUT', '/api/user/custom-url', [ProfileController::class, 'updateCustomUrl']],

    // Experience endpoints
    ['GET', '/api/user/experience', [ExperienceController::class, 'getExperience']],
    ['POST', '/api/user/experience', [ExperienceController::class, 'addExperience']],
    ['PUT', '/api/user/experience/{id}', [ExperienceController::class, 'updateExperience']],
    ['DELETE', '/api/user/experience/{id}', [ExperienceController::class, 'deleteExperience']],

    // Education endpoints
    ['GET', '/api/user/education', [EducationController::class, 'getEducation']],
    ['POST', '/api/user/education', [EducationController::class, 'addEducation']],
    ['PUT', '/api/user/education/{id}', [EducationController::class, 'updateEducation']],
    ['DELETE', '/api/user/education/{id}', [EducationController::class, 'deleteEducation']],

    // Resume endpoints
    ['GET', '/api/user/resume', [ResumeController::class, 'getResume']],
    ['PUT', '/api/user/resume', [ResumeController::class, 'updateResume']],
];
