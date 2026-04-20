<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Http\Request;

final class AuthMiddleware
{
    public function authenticate(Request $request): bool
    {
        $authHeader = (string)($request->header('authorization') ?? '');
        $userId = (string)($request->header('x-user-id') ?? '');
        $role = (string)($request->header('x-user-role') ?? '');

        if ($authHeader !== '' && str_starts_with(strtolower($authHeader), 'bearer ')) {
            $token = trim(substr($authHeader, 7));
            $resolved = $this->decodeSimpleToken($token);
            if ($resolved !== null) {
                $request->setUser($resolved);
                return true;
            }
        }

        if ($userId !== '' && $role !== '') {
            $request->setUser([
                'id' => $userId,
                'role' => strtolower($role),
            ]);
            return true;
        }

        $appEnv = strtolower((string)(getenv('APP_ENV') ?: 'local'));
        if ($appEnv === 'local') {
            $request->setUser([
                'id' => 'local-admin',
                'role' => 'admin',
            ]);
            return true;
        }

        return false;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function decodeSimpleToken(string $token): ?array
    {
        if ($token === '') {
            return null;
        }

        $parts = explode('.', $token);
        $payloadSegment = count($parts) >= 2 ? $parts[1] : $token;

        $payloadSegment = str_replace(['-', '_'], ['+', '/'], $payloadSegment);
        $padding = strlen($payloadSegment) % 4;
        if ($padding > 0) {
            $payloadSegment .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode($payloadSegment, true);
        if (!is_string($decoded)) {
            return null;
        }

        $payload = json_decode($decoded, true);
        if (!is_array($payload)) {
            return null;
        }

        $userId = isset($payload['sub']) ? (string)$payload['sub'] : (string)($payload['id'] ?? '');
        $role = strtolower((string)($payload['role'] ?? ''));

        if ($userId === '' || $role === '') {
            return null;
        }

        return [
            'id' => $userId,
            'role' => $role,
        ];
    }
}
