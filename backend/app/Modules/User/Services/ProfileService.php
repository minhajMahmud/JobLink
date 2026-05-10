<?php

declare(strict_types=1);

namespace App\Modules\User\Services;

use App\Modules\User\Repositories\UserRepository;
use App\Modules\User\Models\User;

final class ProfileService
{
    private UserRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    /**
     * Get complete user profile
     * 
     * @return array<string, mixed>|null
     */
    public function getProfile(string $userId): ?array
    {
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            return null;
        }
        
        $profile = $user->toArray();
        
        // If user is a candidate, fetch additional profile data
        if ($user->role === 'Candidate') {
            $candidateProfile = $this->userRepository->getCandidateProfile($userId);
            
            if ($candidateProfile) {
                $profile['skills'] = $candidateProfile->skills;
                $profile['experience_years'] = $candidateProfile->experienceYears;
                $profile['education_level'] = $candidateProfile->educationLevel;
                $profile['availability_status'] = $candidateProfile->availabilityStatus;
                $profile['salary_min'] = $candidateProfile->salaryMin;
                $profile['salary_max'] = $candidateProfile->salaryMax;
                $profile['resume_url'] = $candidateProfile->resumeUrl;
                $profile['custom_url'] = $candidateProfile->customUrl;
                $profile['profile_strength'] = $candidateProfile->profileStrength;
                
                // Fetch experiences
                $experiences = $this->userRepository->getExperiences($candidateProfile->id);
                $profile['experience'] = array_map(fn($exp) => $exp->toArray(), $experiences);
                
                // Fetch education
                $education = $this->userRepository->getEducation($candidateProfile->id);
                $profile['education'] = array_map(fn($edu) => $edu->toArray(), $education);
            } else {
                // Initialize empty arrays for candidates without profile
                $profile['skills'] = [];
                $profile['experience'] = [];
                $profile['education'] = [];
            }
        }
        
        return $profile;
    }

    /**
     * Update user profile
     * 
     * @param array<string, mixed> $data
     * @return array{success: bool, message: string, errors?: array<string, string>}
     */
    public function updateProfile(string $userId, array $data): array
    {
        // Log the update attempt
        error_log("ProfileService::updateProfile - Attempting to update user: $userId");
        
        // Validate input
        $validation = $this->validateProfileData($data);
        if (!empty($validation)) {
            error_log("ProfileService::updateProfile - Validation failed: " . json_encode($validation));
            return [
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validation,
            ];
        }
        
        // Get user to check role
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            error_log("ProfileService::updateProfile - User not found in database: $userId");
            return [
                'success' => false,
                'message' => 'User not found. Please login again with valid credentials.',
            ];
        }
        
        error_log("ProfileService::updateProfile - User found: {$user->email}, role: {$user->role}");
        
        // Update basic user info
        $userData = [];
        $basicFields = ['first_name', 'last_name', 'phone', 'avatar_url', 'headline', 'location', 'website', 'bio'];
        
        foreach ($basicFields as $field) {
            if (isset($data[$field])) {
                $userData[$field] = $data[$field];
            }
        }
        
        if (!empty($userData)) {
            error_log("ProfileService::updateProfile - Updating basic user fields: " . json_encode(array_keys($userData)));
            $updated = $this->userRepository->updateUser($userId, $userData);
            if (!$updated) {
                error_log("ProfileService::updateProfile - Failed to update basic user info");
                return [
                    'success' => false,
                    'message' => 'Failed to update profile',
                ];
            }
        }
        
        // Update candidate-specific data
        if ($user->role === 'Candidate') {
            $candidateData = [];
            $candidateFields = ['skills', 'experience_years', 'education_level', 'availability_status', 'salary_min', 'salary_max', 'resume_url', 'custom_url'];
            
            foreach ($candidateFields as $field) {
                if (isset($data[$field])) {
                    $candidateData[$field] = $data[$field];
                }
            }
            
            if (!empty($candidateData)) {
                error_log("ProfileService::updateProfile - Updating candidate fields: " . json_encode(array_keys($candidateData)));
                $this->userRepository->updateCandidateProfile($userId, $candidateData);
            }
            
            // Handle experience updates
            if (isset($data['experience']) && is_array($data['experience'])) {
                $candidateProfile = $this->userRepository->getCandidateProfile($userId);
                if ($candidateProfile) {
                    // For simplicity, we'll handle experience/education separately via dedicated endpoints
                    // This is just for updating existing data
                }
            }
        }
        
        error_log("ProfileService::updateProfile - Profile updated successfully for user: $userId");
        return [
            'success' => true,
            'message' => 'Profile updated successfully',
        ];
    }

    /**
     * Handle profile image upload
     * 
     * @param array<string, mixed> $file $_FILES array element
     * @return array{success: bool, url?: string, message?: string}
     */
    public function handleImageUpload(array $file): array
    {
        // Validate file
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return [
                'success' => false,
                'message' => 'No file uploaded',
            ];
        }
        
        // Validate file size (max 2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            return [
                'success' => false,
                'message' => 'File size exceeds 2MB limit',
            ];
        }
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes, true)) {
            return [
                'success' => false,
                'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed',
            ];
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = $this->generateUuid() . '.' . $extension;
        
        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../../../storage/avatars/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $destination = $uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return [
                'success' => false,
                'message' => 'Failed to save file',
            ];
        }
        
        return [
            'success' => true,
            'url' => '/storage/avatars/' . $filename,
        ];
    }

    /**
     * Validate profile data
     * 
     * @param array<string, mixed> $data
     * @return array<string, string> Validation errors
     */
    private function validateProfileData(array $data): array
    {
        $errors = [];
        
        // Validate name - only if provided and not empty
        if (isset($data['first_name'])) {
            $firstName = trim((string)$data['first_name']);
            if ($firstName === '') {
                $errors['first_name'] = 'First name cannot be empty';
            } elseif (strlen($firstName) > 100) {
                $errors['first_name'] = 'First name is too long (maximum 100 characters)';
            }
        }
        
        if (isset($data['last_name']) && strlen((string)$data['last_name']) > 100) {
            $errors['last_name'] = 'Last name is too long (maximum 100 characters)';
        }
        
        // Validate phone
        if (isset($data['phone']) && $data['phone'] !== null && $data['phone'] !== '' && strlen((string)$data['phone']) > 30) {
            $errors['phone'] = 'Phone number is too long (maximum 30 characters)';
        }
        
        // Validate URL fields - only if not empty
        if (isset($data['website']) && $data['website'] !== null && $data['website'] !== '') {
            if (!filter_var($data['website'], FILTER_VALIDATE_URL)) {
                $errors['website'] = 'Invalid website URL';
            }
        }
        
        if (isset($data['avatar_url']) && $data['avatar_url'] !== null && $data['avatar_url'] !== '') {
            if (!filter_var($data['avatar_url'], FILTER_VALIDATE_URL)) {
                $errors['avatar_url'] = 'Invalid avatar URL';
            }
        }
        
        // Validate bio length
        if (isset($data['bio']) && strlen((string)$data['bio']) > 5000) {
            $errors['bio'] = 'Bio is too long (maximum 5000 characters)';
        }
        
        // Validate skills (must be array if provided)
        if (isset($data['skills']) && $data['skills'] !== null && !is_array($data['skills'])) {
            $errors['skills'] = 'Skills must be an array';
        }
        
        // Validate experience years
        if (isset($data['experience_years']) && $data['experience_years'] !== null && $data['experience_years'] !== '') {
            if (!is_numeric($data['experience_years']) || $data['experience_years'] < 0) {
                $errors['experience_years'] = 'Experience years must be a positive number';
            }
        }
        
        // Validate education level - only if provided
        if (isset($data['education_level']) && $data['education_level'] !== null && $data['education_level'] !== '') {
            $validLevels = ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Associate', 'Certificate'];
            if (!in_array($data['education_level'], $validLevels, true)) {
                $errors['education_level'] = 'Invalid education level';
            }
        }
        
        // Validate salary range
        if (isset($data['salary_min']) && $data['salary_min'] !== null && $data['salary_min'] !== '') {
            if (!is_numeric($data['salary_min']) || $data['salary_min'] < 0) {
                $errors['salary_min'] = 'Minimum salary must be a positive number';
            }
        }
        
        if (isset($data['salary_max']) && $data['salary_max'] !== null && $data['salary_max'] !== '') {
            if (!is_numeric($data['salary_max']) || $data['salary_max'] < 0) {
                $errors['salary_max'] = 'Maximum salary must be a positive number';
            }
        }
        
        // Validate salary range relationship
        if (isset($data['salary_min'], $data['salary_max']) && 
            $data['salary_min'] !== null && $data['salary_min'] !== '' &&
            $data['salary_max'] !== null && $data['salary_max'] !== '') {
            if ((float)$data['salary_min'] > (float)$data['salary_max']) {
                $errors['salary'] = 'Minimum salary cannot be greater than maximum salary';
            }
        }
        
        return $errors;
    }

    /**
     * Generate UUID v4
     */
    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}