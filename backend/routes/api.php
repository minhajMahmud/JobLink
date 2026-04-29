<?php

declare(strict_types=1);

return [
	'modules' => [
		'admin' => require __DIR__ . '/../app/Modules/Admin/Routes/api.php',
		'jobs' => require __DIR__ . '/../app/Modules/Jobs/Routes/api.php',
		'recruiter' => require __DIR__ . '/../app/Modules/Recruiter/Routes/api.php',
		'user' => require __DIR__ . '/../app/Modules/User/Routes/api.php',
		// Extend with Auth/Jobs route maps as modules become active.
	],
];
