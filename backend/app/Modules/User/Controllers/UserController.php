<?php

declare(strict_types=1);

namespace App\Modules\User\Controllers;

use App\Core\Http\Request;
use App\Modules\User\Services\ProfileService;

final class UserController
{
    private ProfileService $profileService;

    public function __construct()
    {
        $this->profileService = new ProfileService();
    }

    /**
     * GET /api/users/{id}
     * Get user profile by ID (public view)
     * 
     * @return array<string, mixed>
     */
    public function show(Request $request, string $id): array
    {
        try {
            $profile = $this->profileService->getProfile($id);
            
            if (!$profile) {
                return [
                    'success' => false,
                    'message' => 'User not found',
                ];
            }
            
            // Remove sensitive information for public view
            unset($profile['email_verified_at'], $profile['last_login_at']);
            
            return [
                'success' => true,
                'data' => $profile,
            ];
            
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve user profile',
                'error' => $e->getMessage(),
            ];
        }
    }
}
