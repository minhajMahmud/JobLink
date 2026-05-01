<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Controllers;

use App\Core\Http\Request;
use App\Modules\Jobs\Services\JobService;
use App\Modules\Jobs\Services\JobApplicationService;
use Throwable;

final class JobController
{
    private JobService $jobService;
    private JobApplicationService $applicationService;

    public function __construct()
    {
        $this->jobService = new JobService();
        $this->applicationService = new JobApplicationService();
    }

    /**
     * GET /api/jobs
     * Search and filter jobs with pagination
     * 
     * Query parameters:
     * - keyword: Search in title, description, company
     * - location: Filter by location
     * - type: Job type (Full-time, Part-time, Contract, Internship)
     * - remote_policy: Remote policy (Onsite, Hybrid, Remote)
     * - experience_level: Experience level (Entry, Junior, Mid, Senior, Lead, Executive)
     * - min_salary: Minimum salary
     * - max_salary: Maximum salary
     * - featured: Filter featured jobs (1 or 0)
     * - sort: Sort by (latest, oldest, salary_high, salary_low, relevance)
     * - page: Page number (default: 1)
     * - limit: Results per page (default: 20, max: 100)
     * 
     * @return array<string, mixed>
     */
    public function index(Request $request): array
    {
        try {
            // Extract and sanitize filters
            $filters = [
                'keyword' => trim((string)($request->query('keyword') ?? '')),
                'location' => trim((string)($request->query('location') ?? '')),
                'type' => trim((string)($request->query('type') ?? '')),
                'remote_policy' => trim((string)($request->query('remote_policy') ?? '')),
                'experience_level' => trim((string)($request->query('experience_level') ?? '')),
                'min_salary' => $request->query('min_salary') ? (float)$request->query('min_salary') : null,
                'max_salary' => $request->query('max_salary') ? (float)$request->query('max_salary') : null,
                'featured' => $request->query('featured') === '1' || $request->query('featured') === 'true',
                'sort' => trim((string)($request->query('sort') ?? 'relevance')),
                'page' => max(1, (int)($request->query('page') ?? 1)),
                'limit' => min(100, max(1, (int)($request->query('limit') ?? 20))),
            ];
            
            // Validate filters
            $validationErrors = $this->jobService->validateFilters($filters);
            if (!empty($validationErrors)) {
                return [
                    'success' => false,
                    'message' => 'Invalid filter parameters',
                    'errors' => $validationErrors,
                ];
            }
            
            // Search jobs
            $result = $this->jobService->searchJobs($filters);
            
            return [
                'success' => true,
                'data' => $result['data'],
                'meta' => $result['meta'],
            ];
            
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch jobs',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * GET /api/jobs/{id}
     * Get job details by ID
     * 
     * @return array<string, mixed>
     */
    public function show(Request $request, string $id): array
    {
        try {
            $job = $this->jobService->getJobDetails($id);
            
            if (!$job) {
                return [
                    'success' => false,
                    'message' => 'Job not found',
                ];
            }
            
            return [
                'success' => true,
                'data' => $job,
            ];
            
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch job details',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * POST /api/jobs/{id}/apply
     * Apply for a job
     * 
     * Required: Authentication
     * 
     * Body parameters:
     * - cover_letter: Cover letter text (optional, max 5000 chars)
     * - resume_url: URL to resume (required if resume file not uploaded)
     * - resume: Resume file upload (PDF, DOC, DOCX, max 5MB)
     * 
     * @return array<string, mixed>
     */
    public function apply(Request $request, string $id): array
    {
        try {
            // Check authentication
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return [
                    'success' => false,
                    'message' => 'Authentication required',
                ];
            }
            
            // Get candidate ID from user ID
            // Note: In your system, you need to fetch the candidate record
            // For now, we'll use user_id as candidate_id
            $candidateId = $userId;
            
            // Parse request data
            $data = $request->json();
            
            // Handle file upload if present
            if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = $this->applicationService->handleResumeUpload($_FILES['resume']);
                
                if (!$uploadResult['success']) {
                    return [
                        'success' => false,
                        'message' => $uploadResult['message'],
                    ];
                }
                
                $data['resume_file_path'] = $uploadResult['path'];
            }
            
            // Apply for job
            $result = $this->applicationService->applyForJob($id, $candidateId, $data);
            
            return $result;
            
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to submit application',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * GET /api/jobs/{id}/applications
     * Get all applications for a job (recruiter only)
     * 
     * @return array<string, mixed>
     */
    public function getApplications(Request $request, string $id): array
    {
        try {
            // Check authentication and role
            $userId = (string)($request->user('id') ?? '');
            $userRole = (string)($request->user('role') ?? '');
            
            if ($userId === '' || !in_array($userRole, ['recruiter', 'admin'], true)) {
                return [
                    'success' => false,
                    'message' => 'Unauthorized',
                ];
            }
            
            $applications = $this->applicationService->getJobApplications($id);
            
            return [
                'success' => true,
                'data' => $applications,
                'meta' => [
                    'total' => count($applications),
                ],
            ];
            
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch applications',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * GET /api/my-applications
     * Get current user's job applications
     * 
     * @return array<string, mixed>
     */
    public function myApplications(Request $request): array
    {
        try {
            // Check authentication
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return [
                    'success' => false,
                    'message' => 'Authentication required',
                ];
            }
            
            // Get candidate ID from user ID
            $candidateId = $userId;
            
            $applications = $this->applicationService->getCandidateApplications($candidateId);
            
            return [
                'success' => true,
                'data' => $applications,
                'meta' => [
                    'total' => count($applications),
                ],
            ];
            
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch applications',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * PUT /api/applications/{id}/status
     * Update application status (recruiter only)
     * 
     * Body parameters:
     * - status: New status (Applied, Reviewed, Interview, Offer, Hired, Rejected)
     * 
     * @return array<string, mixed>
     */
    public function updateApplicationStatus(Request $request, string $id): array
    {
        try {
            // Check authentication and role
            $userId = (string)($request->user('id') ?? '');
            $userRole = (string)($request->user('role') ?? '');
            
            if ($userId === '' || !in_array($userRole, ['recruiter', 'admin'], true)) {
                return [
                    'success' => false,
                    'message' => 'Unauthorized',
                ];
            }
            
            $data = $request->json();
            $status = trim((string)($data['status'] ?? ''));
            
            if ($status === '') {
                return [
                    'success' => false,
                    'message' => 'Status is required',
                ];
            }
            
            $result = $this->applicationService->updateApplicationStatus($id, $status);
            
            return $result;
            
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to update application status',
                'error' => $e->getMessage(),
            ];
        }
    }
}
