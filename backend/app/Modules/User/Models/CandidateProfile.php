<?php

declare(strict_types=1);

namespace App\Modules\User\Models;

final class CandidateProfile
{
    public string $id;
    public string $userId;
    /** @var array<string> */
    public array $skills;
    public int $experienceYears;
    public string $educationLevel;
    public string $availabilityStatus;
    public ?int $salaryMin;
    public ?int $salaryMax;
    public ?string $resumeUrl;
    public int $profileStrength;
    public string $createdAt;
    public string $updatedAt;

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $profile = new self();
        $profile->id = (string)($data['id'] ?? '');
        $profile->userId = (string)($data['user_id'] ?? '');
        
        $skills = json_decode((string)($data['skills'] ?? '[]'), true);
        $profile->skills = is_array($skills) ? array_values(array_map('strval', $skills)) : [];
        
        $profile->experienceYears = (int)($data['experience_years'] ?? 0);
        $profile->educationLevel = (string)($data['education_level'] ?? 'Bachelor');
        $profile->availabilityStatus = (string)($data['availability_status'] ?? 'Actively Looking');
        $profile->salaryMin = isset($data['salary_min']) ? (int)$data['salary_min'] : null;
        $profile->salaryMax = isset($data['salary_max']) ? (int)$data['salary_max'] : null;
        $profile->resumeUrl = isset($data['resume_url']) ? (string)$data['resume_url'] : null;
        $profile->profileStrength = (int)($data['profile_strength'] ?? 0);
        $profile->createdAt = (string)($data['created_at'] ?? date('Y-m-d H:i:s'));
        $profile->updatedAt = (string)($data['updated_at'] ?? date('Y-m-d H:i:s'));
        
        return $profile;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'skills' => $this->skills,
            'experience_years' => $this->experienceYears,
            'education_level' => $this->educationLevel,
            'availability_status' => $this->availabilityStatus,
            'salary_min' => $this->salaryMin,
            'salary_max' => $this->salaryMax,
            'resume_url' => $this->resumeUrl,
            'profile_strength' => $this->profileStrength,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
