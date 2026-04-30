<?php

declare(strict_types=1);

return [
	'modules' => [
		'admin'         => require __DIR__ . '/../app/Modules/Admin/Routes/api.php',
		'auth'          => require __DIR__ . '/../app/Modules/Auth/Routes/api.php',
		'feed'          => require __DIR__ . '/../app/Modules/Feed/Routes/api.php',
		'jobs'          => require __DIR__ . '/../app/Modules/Jobs/Routes/api.php',
		'network'       => require __DIR__ . '/../app/Modules/Network/Routes/api.php',
		'notifications' => require __DIR__ . '/../app/Modules/Notifications/Routes/api.php',
		'recruiter'     => require __DIR__ . '/../app/Modules/Recruiter/Routes/api.php',
		'user'          => require __DIR__ . '/../app/Modules/User/Routes/api.php',
	],
];
