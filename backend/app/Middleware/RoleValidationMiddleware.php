<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Http\Request;

final class RoleValidationMiddleware
{
    /**
     * @param array<int, string> $allowedRoles
     */
    public function authorize(Request $request, array $allowedRoles): bool
    {
        $role = (string)($request->user('role') ?? '');

        if ($role === '') {
            return false;
        }

        return in_array($role, $allowedRoles, true);
    }
}
