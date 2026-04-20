<?php

declare(strict_types=1);

namespace App\Modules\Recruiter\Repositories;

final class CandidateRepository
{
    /** @var array<int, array<string, mixed>> */
    private array $savedSearches = [];

    /**
     * @return array<int, array<string, mixed>>
     */
    public function findAll(): array
    {
        return [
            [
                'id' => 'cand-1',
                'user_id' => 'user-1',
                'skills' => ['React', 'TypeScript', 'Node.js'],
                'experience_years' => 5,
                'education_level' => 'Bachelor',
                'location' => 'Dhaka',
                'availability_status' => 'Available',
                'salary_expectation_min' => 60000,
                'salary_expectation_max' => 80000,
                'bio' => 'Full-stack developer with product delivery experience.',
                'avatar_url' => null,
            ],
            [
                'id' => 'cand-2',
                'user_id' => 'user-2',
                'skills' => ['PHP', 'Laravel', 'MySQL'],
                'experience_years' => 4,
                'education_level' => 'Bachelor',
                'location' => 'Chattogram',
                'availability_status' => 'Passive',
                'salary_expectation_min' => 50000,
                'salary_expectation_max' => 70000,
                'bio' => 'Backend engineer focused on scalable APIs.',
                'avatar_url' => null,
            ],
            [
                'id' => 'cand-3',
                'user_id' => 'user-3',
                'skills' => ['Python', 'Django', 'PostgreSQL'],
                'experience_years' => 6,
                'education_level' => 'Master',
                'location' => 'Remote',
                'availability_status' => 'Available',
                'salary_expectation_min' => 75000,
                'salary_expectation_max' => 95000,
                'bio' => 'Senior backend specialist with distributed systems background.',
                'avatar_url' => null,
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findById(string $candidateId): ?array
    {
        foreach ($this->findAll() as $candidate) {
            if (($candidate['id'] ?? null) === $candidateId) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * @param array<int, string> $ids
     * @return array<int, array<string, mixed>>
     */
    public function findByIds(array $ids): array
    {
        $lookup = array_flip($ids);

        return array_values(array_filter(
            $this->findAll(),
            static fn (array $candidate): bool => isset($lookup[(string)($candidate['id'] ?? '')])
        ));
    }

    /**
     * @return array<int, string>
     */
    public function getTrendingSkills(int $limit = 20): array
    {
        $counter = [];
        foreach ($this->findAll() as $candidate) {
            foreach (($candidate['skills'] ?? []) as $skill) {
                $counter[$skill] = ($counter[$skill] ?? 0) + 1;
            }
        }

        arsort($counter);

        return array_slice(array_keys($counter), 0, max(1, $limit));
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function saveCandidateSearch(string $recruiterId, string $name, array $filters): array
    {
        $saved = [
            'id' => 'search-' . (count($this->savedSearches) + 1),
            'recruiter_id' => $recruiterId,
            'name' => $name,
            'filters' => $filters,
            'created_at' => date(DATE_ATOM),
        ];

        $this->savedSearches[] = $saved;

        return $saved;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getSavedSearches(string $recruiterId): array
    {
        return array_values(array_filter(
            $this->savedSearches,
            static fn (array $item): bool => ($item['recruiter_id'] ?? null) === $recruiterId
        ));
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getSavedSearchById(string $searchId, string $recruiterId): ?array
    {
        foreach ($this->savedSearches as $saved) {
            if (($saved['id'] ?? null) === $searchId && ($saved['recruiter_id'] ?? null) === $recruiterId) {
                return $saved;
            }
        }

        return null;
    }

    public function deleteSavedSearch(string $searchId, string $recruiterId): void
    {
        $this->savedSearches = array_values(array_filter(
            $this->savedSearches,
            static fn (array $item): bool => !(($item['id'] ?? null) === $searchId && ($item['recruiter_id'] ?? null) === $recruiterId)
        ));
    }
}
