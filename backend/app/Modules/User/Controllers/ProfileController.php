<?php

declare(strict_types=1);

namespace App\Modules\User\Controllers;

use App\Core\Http\Request;
use App\Modules\User\Services\ProfileService;
use Throwable;

final class ProfileController
{
    private ProfileService $profileService;

    public function __construct()
    {
        $this->profileService = new ProfileService();
    }

    /**
     * GET /api/profile
     * Get authenticated user's profile
     * 
     * @return array<string, mixed>
     */
    public function getProfile(Request $request): array
    {
        try {
            // Check authentication
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return [
                    'status' => false,
                    'message' => 'Authentication required',
                ];
            }
            
            $profile = $this->profileService->getProfile($userId);
            
            if (!$profile) {
                return [
                    'status' => false,
                    'message' => 'Profile not found',
                ];
            }
            
            return [
                'status' => true,
                'message' => 'Profile retrieved successfully',
                'data' => $profile,
            ];
            
        } catch (Throwable $e) {
            return [
                'status' => false,
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * PUT /api/profile
     * Update authenticated user's profile
     * 
     * Body parameters:
     * - first_name: First name (required if provided)
     * - last_name: Last name
     * - phone: Phone number
     * - bio: Biography
     * - headline: Professional headline
     * - location: Location
     * - website: Website URL
     * - skills: Array of skills (for candidates)
     * - experience_years: Years of experience (for candidates)
     * - education_level: Education level (for candidates)
     * - availability_status: Availability status (for candidates)
     * - salary_min: Minimum salary expectation (for candidates)
     * - salary_max: Maximum salary expectation (for candidates)
     * - profile_image: Profile image file upload (multipart/form-data)
     * 
     * @return array<string, mixed>
     */
    public function updateProfile(Request $request): array
    {
        try {
            // Check authentication
            $userId = (string)($request->user('id') ?? '');
            
            if ($userId === '') {
                return [
                    'status' => false,
                    'message' => 'Authentication required',
                ];
            }
            
            // Parse request data
            $data = $request->json();
            
            // Handle profile image upload if present
            if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = $this->profileService->handleImageUpload($_FILES['profile_image']);
                
                if (!$uploadResult['success']) {
                    return [
                        'status' => false,
                        'message' => $uploadResult['message'],
                    ];
                }
                
                $data['avatar_url'] = $uploadResult['url'];
            }
            
            // Update profile
            $result = $this->profileService->updateProfile($userId, $data);
            
            if (!$result['success']) {
                return [
                    'status' => false,
                    'message' => $result['message'],
                    'errors' => $result['errors'] ?? null,
                ];
            }
            
            // Fetch updated profile
            $profile = $this->profileService->getProfile($userId);
            
            return [
                'status' => true,
                'message' => 'Profile updated successfully',
                'data' => $profile,
            ];
            
        } catch (Throwable $e) {
            return [
                'status' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * POST /api/profile/image
     * Upload profile image
     * 
     * @return array<string, mixed>
     */
    public function uploadImage(Request $request): array
    {
        try {
            // Check authentication
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return [
                    'status' => false,
                    'message' => 'Authentication required',
                ];
            }
            
            // Handle file upload
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                return [
                    'status' => false,
                    'message' => 'No image file uploaded',
                ];
            }
            
            $uploadResult = $this->profileService->handleImageUpload($_FILES['image']);
            
            if (!$uploadResult['success']) {
                return [
                    'status' => false,
                    'message' => $uploadResult['message'],
                ];
            }
            
            // Update user's avatar_url
            $result = $this->profileService->updateProfile($userId, [
                'avatar_url' => $uploadResult['url'],
            ]);
            
            if (!$result['success']) {
                return [
                    'status' => false,
                    'message' => 'Failed to update profile image',
                ];
            }
            
            return [
                'status' => true,
                'message' => 'Profile image uploaded successfully',
                'data' => [
                    'url' => $uploadResult['url'],
                ],
            ];
            
        } catch (Throwable $e) {
            return [
                'status' => false,
                'message' => 'Failed to upload image',
                'error' => $e->getMessage(),
            ];
        }
    }
}
