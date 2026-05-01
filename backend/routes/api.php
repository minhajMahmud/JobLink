<?php

declare(strict_types=1);

// Load base user routes
$userRoutes = require __DIR__ . '/../app/Modules/User/Routes/api.php';

// Load profile routes
$profileRoutes = require __DIR__ . '/../app/Modules/User/Routes/profile.php';

// Merge profile routes into user module (to support both /api/user/profile and /api/profile)
$mergedUserRoutes = [
    'prefix' => $userRoutes['prefix'],
    'middleware' => $userRoutes['middleware'],
    'routes' => $userRoutes['routes'],
];

return [
	'modules' => [
		'admin'         => require __DIR__ . '/../app/Modules/Admin/Routes/api.php',
		'auth'          => require __DIR__ . '/../app/Modules/Auth/Routes/api.php',
		'feed'          => require __DIR__ . '/../app/Modules/Feed/Routes/api.php',
		'jobs'          => require __DIR__ . '/../app/Modules/Jobs/Routes/api.php',
		'network'       => require __DIR__ . '/../app/Modules/Network/Routes/api.php',
		'notifications' => require __DIR__ . '/../app/Modules/Notifications/Routes/api.php',
		'recruiter'     => require __DIR__ . '/../app/Modules/Recruiter/Routes/api.php',
		'user'          => $mergedUserRoutes,
		// Profile shorthand routes (same controller, different prefix)
		'user-profile'  => array_merge($profileRoutes, ['_module_override' => 'user']),
	],
];
