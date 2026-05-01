<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Models;

final class Job
{
    public string $id;
    public string $companyId;
    public string $recruiterId;
    public string $title;
    public string $description;
    public ?string $requirements;
    public ?string $benefits;
    public ?string $location;
    public string $remotePolicy;
    public string $jobType;
    public string $experienceLevel;
    public ?float $salaryMin;
    public ?float $salaryMax;
    public string $currency;
    /** @var array<string> */
    public array $requiredSkills;
    public int $applicationsCount;
    public int $viewsCount;
    public string $status;
    public bool $featured;
    public ?string $publishedAt;
    public ?string $closedAt;
    public string $createdAt;
    public string $updatedAt;

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $job = new self();
        $job->id = (string)($data['id'] ?? '');
        $job->companyId = (string)($data['company_id'] ?? '');
        $job->recruiterId = (string)($data['recruiter_id'] ?? '');
        $job->title = (string)($data['title'] ?? '');
        $job->description = (string)($data['description'] ?? '');
        $job->requirements = isset($data['requirements']) ? (string)$data['requirements'] : null;
        $job->benefits = isset($data['benefits']) ? (string)$data['benefits'] : null;
        $job->location = isset($data['location']) ? (string)$data['location'] : null;
        $job->remotePolicy = (string)($data['remote_policy'] ?? 'Hybrid');
        $job->jobType = (string)($data['job_type'] ?? 'Full-time');
        $job->experienceLevel = (string)($data['experience_level'] ?? 'Mid');
        $job->salaryMin = isset($data['salary_min']) ? (float)$data['salary_min'] : null;
        $job->salaryMax = isset($data['salary_max']) ? (float)$data['salary_max'] : null;
        $job->currency = (string)($data['currency'] ?? 'USD');
        
        $skills = json_decode((string)($data['required_skills'] ?? '[]'), true);
        $job->requiredSkills = is_array($skills) ? array_values(array_map('strval', $skills)) : [];
        
        $job->applicationsCount = (int)($data['applications_count'] ?? 0);
        $job->viewsCount = (int)($data['views_count'] ?? 0);
        $job->status = (string)($data['status'] ?? 'Draft');
        $job->featured = (bool)($data['featured'] ?? false);
        $job->publishedAt = isset($data['published_at']) ? (string)$data['published_at'] : null;
        $job->closedAt = isset($data['closed_at']) ? (string)$data['closed_at'] : null;
        $job->createdAt = (string)($data['created_at'] ?? date('Y-m-d H:i:s'));
        $job->updatedAt = (string)($data['updated_at'] ?? date('Y-m-d H:i:s'));
        
        return $job;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->companyId,
            'recruiter_id' => $this->recruiterId,
            'title' => $this->title,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'benefits' => $this->benefits,
            'location' => $this->location,
            'remote_policy' => $this->remotePolicy,
            'job_type' => $this->jobType,
            'experience_level' => $this->experienceLevel,
            'salary_min' => $this->salaryMin,
            'salary_max' => $this->salaryMax,
            'currency' => $this->currency,
            'required_skills' => $this->requiredSkills,
            'applications_count' => $this->applicationsCount,
            'views_count' => $this->viewsCount,
            'status' => $this->status,
            'featured' => $this->featured,
            'published_at' => $this->publishedAt,
            'closed_at' => $this->closedAt,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
