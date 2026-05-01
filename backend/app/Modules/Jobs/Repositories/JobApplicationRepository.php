<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Repositories;

use App\Core\Database\Connection;
use App\Modules\Jobs\Models\JobApplication;
use PDO;

final class JobApplicationRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Connection::getPdo();
    }

    /**
     * Create a new job application
     */
    public function create(JobApplication $application): bool
    {
        $sql = "INSERT INTO job_applications 
                (id, job_id, candidate_id, status, match_score, cover_letter, resume_url, resume_file_path, applied_at)
                VALUES 
                (:id, :job_id, :candidate_id, :status, :match_score, :cover_letter, :resume_url, :resume_file_path, NOW())";
        
        $stmt = $this->pdo->prepare($sql);
        
        return $stmt->execute([
            'id' => $application->id,
            'job_id' => $application->jobId,
            'candidate_id' => $application->candidateId,
            'status' => $application->status,
            'match_score' => $application->matchScore,
            'cover_letter' => $application->coverLetter,
            'resume_url' => $application->resumeUrl,
            'resume_file_path' => $application->resumeFilePath,
        ]);
    }

    /**
     * Check if user has already applied to this job
     */
    public function hasApplied(string $jobId, string $candidateId): bool
    {
        $sql = "SELECT COUNT(*) FROM job_applications 
                WHERE job_id = :job_id AND candidate_id = :candidate_id";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'job_id' => $jobId,
            'candidate_id' => $candidateId,
        ]);
        
        return (int)$stmt->fetchColumn() > 0;
    }

    /**
     * Get application by ID
     */
    public function findById(string $id): ?JobApplication
    {
        $sql = "SELECT * FROM job_applications WHERE id = :id LIMIT 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        return JobApplication::fromArray($row);
    }

    /**
     * Get all applications for a specific job
     * 
     * @return array<JobApplication>
     */
    public function getApplicationsByJob(string $jobId): array
    {
        $sql = "SELECT ja.*, 
                       u.first_name, u.last_name, u.email,
                       c.avatar_url, c.bio, c.location as candidate_location
                FROM job_applications ja
                INNER JOIN candidates c ON c.id = ja.candidate_id
                INNER JOIN users u ON u.id = c.user_id
                WHERE ja.job_id = :job_id
                ORDER BY ja.applied_at DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['job_id' => $jobId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn(array $row): JobApplication => JobApplication::fromArray($row), $rows);
    }

    /**
     * Get all applications by a candidate
     * 
     * @return array<JobApplication>
     */
    public function getApplicationsByCandidate(string $candidateId): array
    {
        $sql = "SELECT ja.*, 
                       j.title as job_title, j.location as job_location,
                       c.name as company_name, c.logo as company_logo
                FROM job_applications ja
                INNER JOIN jobs j ON j.id = ja.job_id
                INNER JOIN companies c ON c.id = j.company_id
                WHERE ja.candidate_id = :candidate_id
                ORDER BY ja.applied_at DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['candidate_id' => $candidateId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn(array $row): JobApplication => JobApplication::fromArray($row), $rows);
    }

    /**
     * Update application status
     */
    public function updateStatus(string $applicationId, string $status): bool
    {
        $sql = "UPDATE job_applications 
                SET status = :status, updated_at = NOW() 
                WHERE id = :id";
        
        $stmt = $this->pdo->prepare($sql);
        
        return $stmt->execute([
            'id' => $applicationId,
            'status' => $status,
        ]);
    }

    /**
     * Increment job applications count
     */
    public function incrementJobApplicationCount(string $jobId): void
    {
        $sql = "UPDATE jobs SET applications_count = applications_count + 1 WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $jobId]);
    }

    /**
     * Get application statistics for a candidate
     * 
     * @return array<string, mixed>
     */
    public function getCandidateStats(string $candidateId): array
    {
        $sql = "SELECT 
                    COUNT(*) as total_applications,
                    COUNT(CASE WHEN status = 'Applied' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'Interview' THEN 1 END) as interviews,
                    COUNT(CASE WHEN status = 'Offer' THEN 1 END) as offers,
                    COUNT(CASE WHEN status = 'Hired' THEN 1 END) as hired,
                    COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected
                FROM job_applications
                WHERE candidate_id = :candidate_id";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['candidate_id' => $candidateId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }
}
