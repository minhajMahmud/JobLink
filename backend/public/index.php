<?php

declare(strict_types=1);

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleValidationMiddleware;

$bootstrap = require __DIR__ . '/../bootstrap/app.php';
$routeRegistry = $bootstrap['routes'] ?? [];

$request = Request::fromGlobals();
$method = strtoupper($request->method());
$path = $request->path();

if ($path === '/health' || $path === '/api/health') {
    Response::json([
        'service' => 'JobLink API',
        'status' => 'ok',
        'timestamp' => date(DATE_ATOM),
    ])->send();
    exit;
}

if (!str_starts_with($path, '/api/')) {
    Response::json(['error' => 'Not Found'], 404)->send();
    exit;
}

$apiPath = substr($path, 4);
if ($apiPath === false || $apiPath === '') {
    $apiPath = '/';
}

$auth = new AuthMiddleware();
$rbac = new RoleValidationMiddleware();

$matched = null;
foreach (($routeRegistry['modules'] ?? []) as $moduleName => $moduleConfig) {
    $prefix = (string)($moduleConfig['prefix'] ?? '');
    $routes = $moduleConfig['routes'] ?? [];

    foreach ($routes as $definition) {
        if (!is_array($definition) || count($definition) < 3) {
            continue;
        }

        [$routeMethod, $routePath, $handler] = $definition;
        if (strtoupper((string)$routeMethod) !== $method) {
            continue;
        }

        $template = $prefix . (string)$routePath;
        $parameterNames = [];
        $pattern = preg_replace_callback(
            '/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/',
            static function (array $m) use (&$parameterNames): string {
                $parameterNames[] = $m[1];
                return '([^/]+)';
            },
            $template
        );

        if (!is_string($pattern)) {
            continue;
        }

        $regex = '#^' . $pattern . '$#';
        $matches = [];
        if (preg_match($regex, $apiPath, $matches) !== 1) {
            continue;
        }

        $params = [];
        foreach ($parameterNames as $idx => $name) {
            $params[$name] = (string)($matches[$idx + 1] ?? '');
        }

        $matched = [
            'module' => (string)$moduleName,
            'moduleConfig' => $moduleConfig,
            'handler' => (string)$handler,
            'params' => $params,
        ];
        break 2;
    }
}

if (!is_array($matched)) {
    Response::json(['error' => 'Route not found'], 404)->send();
    exit;
}

$moduleMiddleware = $matched['moduleConfig']['middleware'] ?? [];
if (in_array('auth', $moduleMiddleware, true) && !$auth->authenticate($request)) {
    Response::json(['error' => 'Unauthorized'], 401)->send();
    exit;
}

foreach ($moduleMiddleware as $mw) {
    if (!is_string($mw) || !str_starts_with($mw, 'role:')) {
        continue;
    }

    $rolesRaw = substr($mw, 5);
    $roles = array_values(array_filter(array_map('trim', explode(',', $rolesRaw)), static fn (string $r): bool => $r !== ''));
    if (!$rbac->authorize($request, $roles)) {
        Response::json(['error' => 'Forbidden'], 403)->send();
        exit;
    }
}

[$controllerShort, $action] = array_pad(explode('@', $matched['handler'], 2), 2, '');
if ($controllerShort === '' || $action === '') {
    Response::json(['error' => 'Invalid route handler'], 500)->send();
    exit;
}

$controllerClass = sprintf(
    'App\\Modules\\%s\\Controllers\\%s',
    ucfirst($matched['module']),
    $controllerShort
);

if (!class_exists($controllerClass)) {
    Response::json(['error' => 'Controller not found', 'controller' => $controllerClass], 500)->send();
    exit;
}

$controller = new $controllerClass();
if (!method_exists($controller, $action)) {
    Response::json(['error' => 'Action not found', 'action' => $action], 500)->send();
    exit;
}

$request->setRouteParams($matched['params']);
$orderedParams = [];
foreach ($matched['params'] as $value) {
    $orderedParams[] = $value;
}

try {
    $result = $controller->{$action}($request, ...$orderedParams);
    if ($result instanceof Response) {
        $result->send();
    } else {
        Response::json($result)->send();
    }
} catch (Throwable $e) {
    $isDebug = filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOL);
    Response::json([
        'error' => 'Internal server error',
        'message' => $isDebug ? $e->getMessage() : 'An unexpected error occurred',
    ], 500)->send();
}
