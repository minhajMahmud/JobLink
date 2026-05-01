<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Services;

use App\Modules\Jobs\Models\JobApplication;
use App\Modules\Jobs\Repositories\JobApplicationRepository;
use App\Modules\Jobs\Repositories\JobRepository;

final class JobApplicationService
{
    private JobApplicationRepository $applicationRepository;
    private JobRepository $jobRepository;

    public function __construct()
    {
        $this->applicationRepository = new JobApplicationRepository();
        $this->jobRepository = new JobRepository();
    }

    /**
     * Apply for a job
     * 
     * @param array<string, mixed> $data
     * @return array{success: bool, message: string, data?: array<string, mixed>}
     */
    public function applyForJob(string $jobId, string $candidateId, array $data): array
    {
        // Validate job exists and is published
        if (!$this->jobRepository->isJobPublished($jobId)) {
            return [
                'success' => false,
                'message' => 'Job not found or not available for applications',
            ];
        }
        
        // Check if already applied
        if ($this->applicationRepository->hasApplied($jobId, $candidateId)) {
            return [
                'success' => false,
                'message' => 'You have already applied to this job',
            ];
        }
        
        // Validate required fields
        $validation = $this->validateApplicationData($data);
        if (!empty($validation)) {
            return [
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validation,
            ];
        }
        
        // Create application
        $application = new JobApplication();
        $application->id = $this->generateUuid();
        $application->jobId = $jobId;
        $application->candidateId = $candidateId;
        $application->status = 'Applied';
        $application->coverLetter = $data['cover_letter'] ?? null;
        $application->resumeUrl = $data['resume_url'] ?? null;
        $application->resumeFilePath = $data['resume_file_path'] ?? null;
        $application->matchScore = (int)($data['match_score'] ?? 0);
        
        $created = $this->applicationRepository->create($application);
        
        if (!$created) {
            return [
                'success' => false,
                'message' => 'Failed to submit application',
            ];
        }
        
        // Increment job application count
        $this->applicationRepository->incrementJobApplicationCount($jobId);
        
        return [
            'success' => true,
            'message' => 'Application submitted successfully',
            'data' => [
                'application_id' => $application->id,
                'job_id' => $jobId,
                'status' => $application->status,
                'applied_at' => date('Y-m-d H:i:s'),
            ],
        ];
    }

    /**
     * Get candidate's applications
     * 
     * @return array<array<string, mixed>>
     */
    public function getCandidateApplications(string $candidateId): array
    {
        $applications = $this->applicationRepository->getApplicationsByCandidate($candidateId);
        
        return array_map(
            fn(JobApplication $app): array => $app->toArray(),
            $applications
        );
    }

    /**
     * Get applications for a job
     * 
     * @return array<array<string, mixed>>
     */
    public function getJobApplications(string $jobId): array
    {
        $applications = $this->applicationRepository->getApplicationsByJob($jobId);
        
        return array_map(
            fn(JobApplication $app): array => $app->toArray(),
            $applications
        );
    }

    /**
     * Update application status
     * 
     * @return array{success: bool, message: string}
     */
    public function updateApplicationStatus(string $applicationId, string $status): array
    {
        $validStatuses = ['Applied', 'Reviewed', 'Interview', 'Offer', 'Hired', 'Rejected'];
        
        if (!in_array($status, $validStatuses, true)) {
            return [
                'success' => false,
                'message' => 'Invalid status',
            ];
        }
        
        $updated = $this->applicationRepository->updateStatus($applicationId, $status);
        
        if (!$updated) {
            return [
                'success' => false,
                'message' => 'Failed to update application status',
            ];
        }
        
        return [
            'success' => true,
            'message' => 'Application status updated successfully',
        ];
    }

    /**
     * Validate application data
     * 
     * @param array<string, mixed> $data
     * @return array<string, string> Validation errors
     */
    private function validateApplicationData(array $data): array
    {
        $errors = [];
        
        // Resume is required (either URL or file path)
        if (empty($data['resume_url']) && empty($data['resume_file_path'])) {
            $errors['resume'] = 'Resume is required';
        }
        
        // Validate resume URL format if provided
        if (!empty($data['resume_url']) && !filter_var($data['resume_url'], FILTER_VALIDATE_URL)) {
            $errors['resume_url'] = 'Invalid resume URL format';
        }
        
        // Validate cover letter length if provided
        if (isset($data['cover_letter']) && strlen($data['cover_letter']) > 5000) {
            $errors['cover_letter'] = 'Cover letter is too long (maximum 5000 characters)';
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

    /**
     * Handle resume file upload
     * 
     * @param array<string, mixed> $file $_FILES array element
     * @return array{success: bool, path?: string, message?: string}
     */
    public function handleResumeUpload(array $file): array
    {
        // Validate file
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return [
                'success' => false,
                'message' => 'No file uploaded',
            ];
        }
        
        // Validate file size (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            return [
                'success' => false,
                'message' => 'File size exceeds 5MB limit',
            ];
        }
        
        // Validate file type
        $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes, true)) {
            return [
                'success' => false,
                'message' => 'Invalid file type. Only PDF and DOC/DOCX files are allowed',
            ];
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = $this->generateUuid() . '.' . $extension;
        
        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../../../storage/resumes/';
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
            'path' => 'storage/resumes/' . $filename,
        ];
    }
}
