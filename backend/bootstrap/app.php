<?php

declare(strict_types=1);

$envPath = __DIR__ . '/../.env';
if (is_file($envPath)) {
	$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
	foreach ($lines as $line) {
		$trimmed = trim($line);
		if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
			continue;
		}

		[$name, $value] = explode('=', $trimmed, 2);
		$name = trim($name);
		$value = trim($value);

		if ($name === '') {
			continue;
		}

		if (getenv($name) === false) {
			putenv($name . '=' . $value);
			$_ENV[$name] = $value;
			$_SERVER[$name] = $value;
		}
	}
}

spl_autoload_register(static function (string $class): void {
	$prefix = 'App\\';
	if (!str_starts_with($class, $prefix)) {
		return;
	}

	$relative = substr($class, strlen($prefix));
	if ($relative === false) {
		return;
	}

	$file = __DIR__ . '/../app/' . str_replace('\\', '/', $relative) . '.php';
	if (is_file($file)) {
		require_once $file;
	}
});

return [
	'config' => [
		'app' => require __DIR__ . '/../config/app.php',
		'database' => require __DIR__ . '/../config/database.php',
	],
	'routes' => require __DIR__ . '/../routes/api.php',
];
