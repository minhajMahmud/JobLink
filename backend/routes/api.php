<?php

declare(strict_types=1);

return [
	'modules' => [
		'admin' => require __DIR__ . '/../app/Modules/Admin/Routes/api.php',
		'recruiter' => require __DIR__ . '/../app/Modules/Recruiter/Routes/api.php',
		// Extend with Auth/User/Jobs route maps as modules become active.
	],
];
