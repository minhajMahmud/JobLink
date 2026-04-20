<?php

declare(strict_types=1);

namespace App\Modules\Recruiter\Services;

use App\Modules\Recruiter\Repositories\CandidateRepository;

final class CandidateSearchService
{
    public function __construct(private CandidateRepository $candidateRepository)
    {
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function search(array $filters): array
    {
        $candidates = $this->candidateRepository->findAll();

        $filtered = array_values(array_filter($candidates, function (array $candidate) use ($filters): bool {
            if (!empty($filters['skills']) && is_array($filters['skills'])) {
                $required = array_map('strtolower', $filters['skills']);
                $actual = array_map('strtolower', $candidate['skills'] ?? []);
                if (count(array_intersect($required, $actual)) === 0) {
                    return false;
                }
            }

            $expMin = (int)($filters['exp_min'] ?? 0);
            $expMax = (int)($filters['exp_max'] ?? 0);
            $experience = (int)($candidate['experience_years'] ?? 0);
            if ($expMin > 0 && $experience < $expMin) {
                return false;
            }
            if ($expMax > 0 && $experience > $expMax) {
                return false;
            }

            if (!empty($filters['location'])) {
                $location = strtolower((string)$filters['location']);
                $candidateLocation = strtolower((string)($candidate['location'] ?? ''));
                if (!str_contains($candidateLocation, $location)) {
                    return false;
                }
            }

            if (!empty($filters['availability'])) {
                if (($candidate['availability_status'] ?? null) !== $filters['availability']) {
                    return false;
                }
            }

            if (!empty($filters['search_query'])) {
                $query = strtolower((string)$filters['search_query']);
                $bio = strtolower((string)($candidate['bio'] ?? ''));
                if (!str_contains($bio, $query)) {
                    return false;
                }
            }

            return true;
        }));

        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = max(1, (int)($filters['limit'] ?? 20));
        $offset = ($page - 1) * $limit;

        return [
            'data' => array_slice($filtered, $offset, $limit),
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => count($filtered),
                'total_pages' => (int)ceil(max(1, count($filtered)) / $limit),
            ],
        ];
    }

    public function calculateMatchScore(string $candidateId, string $jobId): float
    {
        $candidate = $this->candidateRepository->findById($candidateId);
        if ($candidate === null) {
            return 0.0;
        }

        // Placeholder deterministic score for scaffold stage.
        return (float)(70 + (strlen($candidateId . $jobId) % 30));
    }

    /**
     * @return array<string, mixed>
     */
    public function getCandidatesForJob(string $jobId, int $page = 1, int $limit = 20): array
    {
        $result = $this->search([
            'page' => $page,
            'limit' => $limit,
        ]);

        $result['job_id'] = $jobId;

        return $result;
    }
}
