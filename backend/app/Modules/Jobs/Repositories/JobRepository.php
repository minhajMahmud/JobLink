<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Repositories;

use App\Core\Database\Connection;
use App\Modules\Jobs\Models\Job;
use PDO;
use Throwable;

final class JobRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Connection::getPdo();
    }

    /**
     * Search and filter jobs with pagination
     * 
     * @param array<string, mixed> $filters
     * @return array{data: array<Job>, total: int}
     */
    public function searchJobs(array $filters): array
    {
        $conditions = ['j.status = :status'];
        $params = ['status' => 'Published'];
        
        // Keyword search (title, description, company)
        if (!empty($filters['keyword'])) {
            $conditions[] = '(j.title LIKE :keyword OR j.description LIKE :keyword OR c.name LIKE :keyword)';
            $params['keyword'] = '%' . $filters['keyword'] . '%';
        }
        
        // Location filter
        if (!empty($filters['location'])) {
            $conditions[] = 'j.location LIKE :location';
            $params['location'] = '%' . $filters['location'] . '%';
        }
        
        // Job type filter
        if (!empty($filters['type'])) {
            $conditions[] = 'j.job_type = :type';
            $params['type'] = $filters['type'];
        }
        
        // Remote policy filter
        if (!empty($filters['remote_policy'])) {
            $conditions[] = 'j.remote_policy = :remote_policy';
            $params['remote_policy'] = $filters['remote_policy'];
        }
        
        // Experience level filter
        if (!empty($filters['experience_level'])) {
            $conditions[] = 'j.experience_level = :experience_level';
            $params['experience_level'] = $filters['experience_level'];
        }
        
        // Salary range filter
        if (isset($filters['min_salary']) && $filters['min_salary'] > 0) {
            $conditions[] = 'j.salary_max >= :min_salary';
            $params['min_salary'] = $filters['min_salary'];
        }
        
        if (isset($filters['max_salary']) && $filters['max_salary'] > 0) {
            $conditions[] = 'j.salary_min <= :max_salary';
            $params['max_salary'] = $filters['max_salary'];
        }
        
        // Featured jobs
        if (isset($filters['featured']) && $filters['featured']) {
            $conditions[] = 'j.featured = 1';
        }
        
        $whereClause = implode(' AND ', $conditions);
        
        // Sorting
        $sortColumn = 'j.published_at';
        $sortDirection = 'DESC';
        
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'salary_high':
                    $sortColumn = 'j.salary_max';
                    $sortDirection = 'DESC';
                    break;
                case 'salary_low':
                    $sortColumn = 'j.salary_min';
                    $sortDirection = 'ASC';
                    break;
                case 'latest':
                    $sortColumn = 'j.published_at';
                    $sortDirection = 'DESC';
                    break;
                case 'oldest':
                    $sortColumn = 'j.published_at';
                    $sortDirection = 'ASC';
                    break;
                case 'relevance':
                    // For relevance, prioritize featured jobs and recent posts
                    $sortColumn = 'j.featured DESC, j.published_at';
                    $sortDirection = 'DESC';
                    break;
            }
        }
        
        // Count total matching jobs
        $countSql = "SELECT COUNT(*) as total 
                     FROM jobs j 
                     INNER JOIN companies c ON c.id = j.company_id 
                     WHERE $whereClause";
        
        $countStmt = $this->pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)($countStmt->fetchColumn() ?: 0);
        
        // Pagination
        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(100, max(1, (int)($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        // Fetch jobs with company info and application count
        $sql = "SELECT 
                    j.*,
                    c.name as company_name,
                    c.logo as company_logo,
                    c.industry,
                    c.size as company_size,
                    c.website as company_website,
                    COALESCE(app.applicant_count, 0) as applicants
                FROM jobs j
                INNER JOIN companies c ON c.id = j.company_id
                LEFT JOIN (
                    SELECT job_id, COUNT(*) as applicant_count
                    FROM job_applications
                    GROUP BY job_id
                ) app ON app.job_id = j.id
                WHERE $whereClause
                ORDER BY $sortColumn $sortDirection
                LIMIT :limit OFFSET :offset";
        
        $stmt = $this->pdo->prepare($sql);
        
        // Bind all parameters
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $jobs = array_map(fn(array $row): Job => Job::fromArray($row), $rows);
        
        return [
            'data' => $jobs,
            'total' => $total,
        ];
    }

    /**
     * Find job by ID with company details
     */
    public function findById(string $id): ?Job
    {
        $sql = "SELECT 
                    j.*,
                    c.name as company_name,
                    c.logo as company_logo,
                    c.industry,
                    c.size as company_size,
                    c.website as company_website,
                    c.description as company_description,
                    COALESCE(app.applicant_count, 0) as applicants
                FROM jobs j
                INNER JOIN companies c ON c.id = j.company_id
                LEFT JOIN (
                    SELECT job_id, COUNT(*) as applicant_count
                    FROM job_applications
                    GROUP BY job_id
                ) app ON app.job_id = j.id
                WHERE j.id = :id
                LIMIT 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        return Job::fromArray($row);
    }

    /**
     * Increment view count for a job
     */
    public function incrementViewCount(string $jobId): void
    {
        $sql = "UPDATE jobs SET views_count = views_count + 1 WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $jobId]);
    }

    /**
     * Get job statistics
     * 
     * @return array<string, mixed>
     */
    public function getJobStats(string $jobId): array
    {
        $sql = "SELECT 
                    j.applications_count,
                    j.views_count,
                    COUNT(DISTINCT ja.id) as total_applications,
                    COUNT(DISTINCT CASE WHEN ja.status = 'Applied' THEN ja.id END) as pending_applications,
                    COUNT(DISTINCT CASE WHEN ja.status = 'Interview' THEN ja.id END) as interview_applications,
                    COUNT(DISTINCT CASE WHEN ja.status = 'Hired' THEN ja.id END) as hired_applications
                FROM jobs j
                LEFT JOIN job_applications ja ON ja.job_id = j.id
                WHERE j.id = :id
                GROUP BY j.id";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $jobId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Check if job exists and is published
     */
    public function isJobPublished(string $jobId): bool
    {
        $sql = "SELECT COUNT(*) FROM jobs WHERE id = :id AND status = 'Published'";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $jobId]);
        
        return (int)$stmt->fetchColumn() > 0;
    }
}
