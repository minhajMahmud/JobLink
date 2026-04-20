<?php

declare(strict_types=1);

namespace App\Modules\Recruiter\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Modules\Recruiter\Services\CandidateSearchService;
use App\Modules\Recruiter\Repositories\CandidateRepository;

class CandidateController
{
    private CandidateSearchService $searchService;
    private CandidateRepository $candidateRepository;

    public function __construct()
    {
        $this->candidateRepository = new CandidateRepository();
        $this->searchService = new CandidateSearchService($this->candidateRepository);
    }

    /**
     * Search candidates with advanced filters
     * GET /api/recruiter/candidates/search
     */
    public function search(Request $request): Response
    {
        try {
            $filters = [
                'skills' => $request->query('skills') ? explode(',', $request->query('skills')) : [],
                'exp_min' => (int)$request->query('exp_min'),
                'exp_max' => (int)$request->query('exp_max'),
                'education' => $request->query('education') ? explode(',', $request->query('education')) : [],
                'location' => $request->query('location'),
                'availability' => $request->query('availability'),
                'salary_min' => (int)$request->query('salary_min'),
                'salary_max' => (int)$request->query('salary_max'),
                'search_query' => $request->query('q'),
                'sort' => $request->query('sort') ?? 'relevance',
                'page' => (int)($request->query('page') ?? 1),
                'limit' => (int)($request->query('limit') ?? 20),
            ];

            $results = $this->searchService->search($filters);

            return Response::json($results, 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get single candidate profile
     * GET /api/recruiter/candidates/{id}
     */
    public function show(Request $request, string $candidateId): Response
    {
        try {
            $candidate = $this->candidateRepository->findById($candidateId);

            if (!$candidate) {
                return Response::json(['error' => 'Candidate not found'], 404);
            }

            return Response::json($candidate, 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get batch of candidates
     * POST /api/recruiter/candidates/batch
     */
    public function batch(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true);
            $ids = $data['ids'] ?? [];

            $candidates = $this->candidateRepository->findByIds($ids);

            return Response::json($candidates, 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get candidate match score for a job
     * GET /api/recruiter/candidates/{id}/match-score/{jobId}
     */
    public function getMatchScore(Request $request, string $candidateId, string $jobId): Response
    {
        try {
            $score = $this->searchService->calculateMatchScore($candidateId, $jobId);

            return Response::json(['score' => $score], 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get candidates for a specific job
     * GET /api/recruiter/candidates/jobs/{jobId}
     */
    public function getCandidatesForJob(Request $request, string $jobId): Response
    {
        try {
            $page = (int)($request->query('page') ?? 1);
            $limit = (int)($request->query('limit') ?? 20);

            $candidates = $this->searchService->getCandidatesForJob($jobId, $page, $limit);

            return Response::json($candidates, 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get trending skills
     * GET /api/recruiter/candidates/trending-skills
     */
    public function getTrendingSkills(Request $request): Response
    {
        try {
            $limit = (int)($request->query('limit') ?? 20);
            $skills = $this->candidateRepository->getTrendingSkills($limit);

            return Response::json($skills, 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Save a candidate search
     * POST /api/recruiter/candidates/saved-searches
     */
    public function saveCandidateSearch(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true) ?? [];
            $recruiterId = $request->user('id');

            if (empty($data['name']) || !isset($data['filters']) || !is_array($data['filters'])) {
                return Response::json(['error' => 'Invalid payload. name and filters are required.'], 422);
            }

            $savedSearch = $this->candidateRepository->saveCandidateSearch(
                $recruiterId,
                $data['name'],
                $data['filters']
            );

            return Response::json($savedSearch, 201);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get saved searches
     * GET /api/recruiter/candidates/saved-searches
     */
    public function getSavedSearches(Request $request): Response
    {
        try {
            $recruiterId = $request->user('id');
            $searches = $this->candidateRepository->getSavedSearches($recruiterId);

            return Response::json($searches, 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete saved search
     * DELETE /api/recruiter/candidates/saved-searches/{id}
     */
    public function deleteSavedSearch(Request $request, string $searchId): Response
    {
        try {
            $recruiterId = $request->user('id');
            $this->candidateRepository->deleteSavedSearch($searchId, $recruiterId);

            return Response::json(['success' => true], 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Apply saved search
     * GET /api/recruiter/candidates/saved-searches/{id}/apply
     */
    public function applySavedSearch(Request $request, string $searchId): Response
    {
        try {
            $recruiterId = $request->user('id');
            $saved = $this->candidateRepository->getSavedSearchById($searchId, $recruiterId);

            if (!$saved) {
                return Response::json(['error' => 'Saved search not found'], 404);
            }

            $filters = is_array($saved['filters'] ?? null) ? $saved['filters'] : [];
            $results = $this->searchService->search($filters);

            return Response::json([
                'saved_search' => $saved,
                'results' => $results,
            ], 200);
        } catch (\Exception $e) {
            return Response::json(['error' => $e->getMessage()], 500);
        }
    }
}