<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Services;

use App\Modules\Jobs\Models\Job;
use App\Modules\Jobs\Repositories\JobRepository;

final class JobService
{
    private JobRepository $jobRepository;

    public function __construct()
    {
        $this->jobRepository = new JobRepository();
    }

    /**
     * Search and filter jobs
     * 
     * @param array<string, mixed> $filters
     * @return array{data: array<array<string, mixed>>, meta: array<string, mixed>}
     */
    public function searchJobs(array $filters): array
    {
        $result = $this->jobRepository->searchJobs($filters);
        
        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(100, max(1, (int)($filters['limit'] ?? 20)));
        
        // Transform jobs to API response format
        $data = array_map(
            fn(Job $job): array => $this->transformJobToResponse($job),
            $result['data']
        );
        
        return [
            'data' => $data,
            'meta' => [
                'total' => $result['total'],
                'page' => $page,
                'limit' => $limit,
                'pages' => (int)ceil($result['total'] / $limit),
            ],
        ];
    }

    /**
     * Get job details by ID
     * 
     * @return array<string, mixed>|null
     */
    public function getJobDetails(string $id): ?array
    {
        $job = $this->jobRepository->findById($id);
        
        if (!$job) {
            return null;
        }
        
        // Increment view count
        $this->jobRepository->incrementViewCount($id);
        
        // Get job statistics
        $stats = $this->jobRepository->getJobStats($id);
        
        $response = $this->transformJobToResponse($job);
        $response['stats'] = $stats;
        
        return $response;
    }

    /**
     * Transform Job model to API response format
     * 
     * @return array<string, mixed>
     */
    private function transformJobToResponse(Job $job): array
    {
        $salaryFormatted = 'Negotiable';
        if ($job->salaryMin && $job->salaryMax) {
            $salaryFormatted = sprintf(
                '%s%s - %s%s',
                $job->currency === 'USD' ? '$' : $job->currency . ' ',
                number_format($job->salaryMin / 1000, 0) . 'k',
                $job->currency === 'USD' ? '$' : '',
                number_format($job->salaryMax / 1000, 0) . 'k'
            );
        }
        
        $postedAt = strtotime($job->publishedAt ?? $job->createdAt);
        $now = time();
        $diff = $now - $postedAt;
        
        if ($diff < 3600) {
            $postedAtHuman = floor($diff / 60) . ' minutes ago';
        } elseif ($diff < 86400) {
            $postedAtHuman = floor($diff / 3600) . ' hours ago';
        } elseif ($diff < 604800) {
            $postedAtHuman = floor($diff / 86400) . ' days ago';
        } else {
            $postedAtHuman = date('M d, Y', $postedAt);
        }
        
        return [
            'id' => $job->id,
            'title' => $job->title,
            'company' => $job->companyId, // Will be populated with company name from join
            'companyLogo' => '', // Will be populated from join
            'location' => $job->location ?? 'Remote',
            'remotePolicy' => $job->remotePolicy,
            'salary' => $salaryFormatted,
            'salaryMin' => $job->salaryMin,
            'salaryMax' => $job->salaryMax,
            'currency' => $job->currency,
            'type' => $job->jobType,
            'experienceLevel' => $job->experienceLevel,
            'description' => $job->description,
            'requirements' => $job->requirements,
            'benefits' => $job->benefits,
            'skills' => $job->requiredSkills,
            'status' => $job->status,
            'featured' => $job->featured,
            'applicants' => $job->applicationsCount,
            'views' => $job->viewsCount,
            'postedAt' => $postedAtHuman,
            'postedAtISO' => date(DATE_ATOM, $postedAt),
            'publishedAt' => $job->publishedAt,
            'closedAt' => $job->closedAt,
        ];
    }

    /**
     * Calculate match score between candidate skills and job requirements
     * 
     * @param array<string> $candidateSkills
     * @param array<string> $jobSkills
     */
    public function calculateMatchScore(array $candidateSkills, array $jobSkills): int
    {
        if (empty($jobSkills)) {
            return 0;
        }
        
        $candidateSkillsLower = array_map('strtolower', $candidateSkills);
        $jobSkillsLower = array_map('strtolower', $jobSkills);
        
        $matchingSkills = array_intersect($candidateSkillsLower, $jobSkillsLower);
        $matchPercentage = (count($matchingSkills) / count($jobSkillsLower)) * 100;
        
        return (int)round($matchPercentage);
    }

    /**
     * Validate job filters
     * 
     * @param array<string, mixed> $filters
     * @return array<string, string> Validation errors
     */
    public function validateFilters(array $filters): array
    {
        $errors = [];
        
        // Validate job type
        if (isset($filters['type']) && !in_array($filters['type'], ['Full-time', 'Part-time', 'Contract', 'Internship'], true)) {
            $errors['type'] = 'Invalid job type';
        }
        
        // Validate experience level
        if (isset($filters['experience_level']) && !in_array($filters['experience_level'], ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'], true)) {
            $errors['experience_level'] = 'Invalid experience level';
        }
        
        // Validate remote policy
        if (isset($filters['remote_policy']) && !in_array($filters['remote_policy'], ['Onsite', 'Hybrid', 'Remote'], true)) {
            $errors['remote_policy'] = 'Invalid remote policy';
        }
        
        // Validate salary range
        if (isset($filters['min_salary']) && (!is_numeric($filters['min_salary']) || $filters['min_salary'] < 0)) {
            $errors['min_salary'] = 'Invalid minimum salary';
        }
        
        if (isset($filters['max_salary']) && (!is_numeric($filters['max_salary']) || $filters['max_salary'] < 0)) {
            $errors['max_salary'] = 'Invalid maximum salary';
        }
        
        if (isset($filters['min_salary'], $filters['max_salary']) && $filters['min_salary'] > $filters['max_salary']) {
            $errors['salary'] = 'Minimum salary cannot be greater than maximum salary';
        }
        
        // Validate pagination
        if (isset($filters['page']) && (!is_numeric($filters['page']) || $filters['page'] < 1)) {
            $errors['page'] = 'Invalid page number';
        }
        
        if (isset($filters['limit']) && (!is_numeric($filters['limit']) || $filters['limit'] < 1 || $filters['limit'] > 100)) {
            $errors['limit'] = 'Invalid limit (must be between 1 and 100)';
        }
        
        // Validate sort
        if (isset($filters['sort']) && !in_array($filters['sort'], ['latest', 'oldest', 'salary_high', 'salary_low', 'relevance'], true)) {
            $errors['sort'] = 'Invalid sort option';
        }
        
        return $errors;
    }
}
