<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Controllers;

use App\Core\Database\Connection;
use App\Core\Http\Request;
use PDO;
use Throwable;

final class JobController
{
    public function index(Request $request): array
    {
        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            $pdo = null;
        }

        $page = max(1, (int)($request->query('page') ?? 1));
        $limit = max(1, (int)($request->query('limit') ?? 50));

        $filters = [
            'query' => strtolower(trim((string)($request->query('query') ?? ''))),
            'type' => strtolower(trim((string)($request->query('type') ?? ''))),
            'experienceLevel' => strtolower(trim((string)($request->query('experienceLevel') ?? ''))),
            'remotePolicy' => strtolower(trim((string)($request->query('remotePolicy') ?? ''))),
            'company' => strtolower(trim((string)($request->query('company') ?? ''))),
            'location' => strtolower(trim((string)($request->query('location') ?? ''))),
            'industry' => strtolower(trim((string)($request->query('industry') ?? ''))),
            'companySize' => strtolower(trim((string)($request->query('companySize') ?? ''))),
            'skills' => array_values(array_filter(array_map(
                static fn (string $skill): string => strtolower(trim($skill)),
                explode(',', (string)($request->query('skills') ?? ''))
            ))),
        ];

        $records = [];

        if ($pdo instanceof PDO) {
            $sql = <<<SQL
SELECT
    j.id,
    j.title,
    j.location,
    j.remote_policy,
    j.salary_min,
    j.salary_max,
    j.type,
    j.level,
    j.required_skills,
    j.description,
    j.status,
    j.featured,
    j.created_at,
    c.name AS company_name,
    c.industry,
    c.size AS company_size,
    c.logo AS company_logo,
    COALESCE(app.applicant_count, 0) AS applicants
FROM jobs j
INNER JOIN companies c ON c.id = j.company_id
LEFT JOIN (
    SELECT job_id, COUNT(*) AS applicant_count
    FROM job_applications
    GROUP BY job_id
) app ON app.job_id = j.id
WHERE j.status = 'Active'
ORDER BY j.featured DESC, j.created_at DESC
SQL;

            $stmt = $pdo->query($sql);
            $rows = $stmt?->fetchAll() ?: [];

            $records = array_map(fn (array $row): array => $this->mapJobRow($row), $rows);
        }

        if ($records === []) {
            $records = $this->fallbackJobs();
        }

        $records = array_values(array_filter($records, static function (array $job) use ($filters): bool {
            if ($filters['query'] !== '') {
                $haystack = strtolower(implode(' ', [
                    (string)($job['title'] ?? ''),
                    (string)($job['company'] ?? ''),
                    (string)($job['industry'] ?? ''),
                    implode(' ', $job['skills'] ?? []),
                ]));

                if (!str_contains($haystack, $filters['query'])) {
                    return false;
                }
            }

            if ($filters['type'] !== '' && strtolower((string)($job['type'] ?? '')) !== $filters['type']) {
                return false;
            }

            if ($filters['experienceLevel'] !== '' && strtolower((string)($job['experienceLevel'] ?? '')) !== $filters['experienceLevel']) {
                return false;
            }

            if ($filters['remotePolicy'] !== '' && strtolower((string)($job['remotePolicy'] ?? '')) !== $filters['remotePolicy']) {
                return false;
            }

            if ($filters['company'] !== '' && !str_contains(strtolower((string)($job['company'] ?? '')), $filters['company'])) {
                return false;
            }

            if ($filters['location'] !== '' && !str_contains(strtolower((string)($job['location'] ?? '')), $filters['location'])) {
                return false;
            }

            if ($filters['industry'] !== '' && !str_contains(strtolower((string)($job['industry'] ?? '')), $filters['industry'])) {
                return false;
            }

            if ($filters['companySize'] !== '' && strtolower((string)($job['companySize'] ?? '')) !== $filters['companySize']) {
                return false;
            }

            if ($filters['skills'] !== []) {
                $jobSkills = array_map('strtolower', $job['skills'] ?? []);
                $skillMatches = false;
                foreach ($filters['skills'] as $skill) {
                    if (in_array($skill, $jobSkills, true)) {
                        $skillMatches = true;
                        break;
                    }
                }

                if (!$skillMatches) {
                    return false;
                }
            }

            return true;
        }));

        return [
            'data' => array_slice($records, ($page - 1) * $limit, $limit),
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => count($records),
                'total_pages' => (int)ceil(max(1, count($records)) / $limit),
            ],
        ];
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function mapJobRow(array $row): array
    {
        $skills = json_decode((string)($row['required_skills'] ?? '[]'), true);
        $skills = is_array($skills) ? array_values(array_map('strval', $skills)) : [];

        $salaryMin = (int)($row['salary_min'] ?? 0);
        $salaryMax = (int)($row['salary_max'] ?? 0);
        $companyLogo = (string)($row['company_logo'] ?? 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=120&h=120&fit=crop');
        $createdAt = strtotime((string)($row['created_at'] ?? 'now')) ?: time();
        $remotePolicy = ucfirst(strtolower((string)($row['remote_policy'] ?? 'Hybrid')));

        return [
            'id' => (string)($row['id'] ?? ''),
            'title' => (string)($row['title'] ?? ''),
            'company' => (string)($row['company_name'] ?? 'Unknown Company'),
            'companyLogo' => $companyLogo,
            'location' => (string)($row['location'] ?? ''),
            'remotePolicy' => in_array($remotePolicy, ['Onsite', 'Hybrid', 'Remote'], true) ? $remotePolicy : 'Hybrid',
            'industry' => (string)($row['industry'] ?? ''),
            'companySize' => (string)($row['company_size'] ?? '51-200'),
            'salary' => $salaryMin > 0 && $salaryMax > 0 ? sprintf('$%dk - $%dk', $salaryMin, $salaryMax) : 'Negotiable',
            'salaryMin' => $salaryMin,
            'salaryMax' => $salaryMax,
            'type' => (string)($row['type'] ?? 'Full-time'),
            'experienceLevel' => ucfirst((string)($row['level'] ?? 'Mid')),
            'description' => (string)($row['description'] ?? ''),
            'requirements' => $skills,
            'skills' => $skills,
            'benefits' => [],
            'visaSupport' => false,
            'urgentHiring' => (bool)($row['featured'] ?? false),
            'postedAt' => date('M d, Y', $createdAt),
            'postedAtISO' => date(DATE_ATOM, $createdAt),
            'applicants' => (int)($row['applicants'] ?? 0),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fallbackJobs(): array
    {
        return [
            [
                'id' => 'job-1',
                'title' => 'Senior Frontend Engineer',
                'company' => 'TechFlow Inc.',
                'companyLogo' => 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=120&h=120&fit=crop',
                'location' => 'San Francisco, CA',
                'remotePolicy' => 'Hybrid',
                'industry' => 'SaaS',
                'companySize' => '201-1000',
                'salary' => '$160k - $210k',
                'salaryMin' => 160,
                'salaryMax' => 210,
                'type' => 'Full-time',
                'experienceLevel' => 'Senior',
                'description' => 'Build the frontend platform powering product and hiring workflows.',
                'requirements' => ['React', 'TypeScript', 'Design systems'],
                'skills' => ['React', 'TypeScript', 'Design systems'],
                'benefits' => ['Health insurance', 'Remote stipend'],
                'visaSupport' => false,
                'urgentHiring' => true,
                'postedAt' => '2 days ago',
                'postedAtISO' => date(DATE_ATOM, strtotime('-2 days') ?: time()),
                'applicants' => 18,
            ],
            [
                'id' => 'job-2',
                'title' => 'Product Designer',
                'company' => 'DesignHub',
                'companyLogo' => 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=120&h=120&fit=crop',
                'location' => 'Remote',
                'remotePolicy' => 'Remote',
                'industry' => 'Design',
                'companySize' => '51-200',
                'salary' => '$120k - $160k',
                'salaryMin' => 120,
                'salaryMax' => 160,
                'type' => 'Full-time',
                'experienceLevel' => 'Mid',
                'description' => 'Design delightful experiences across candidate and employer tools.',
                'requirements' => ['Figma', 'Design systems', 'Research'],
                'skills' => ['Figma', 'Design systems', 'Research'],
                'benefits' => ['Flexible hours'],
                'visaSupport' => true,
                'urgentHiring' => false,
                'postedAt' => '4 days ago',
                'postedAtISO' => date(DATE_ATOM, strtotime('-4 days') ?: time()),
                'applicants' => 12,
            ],
        ];
    }

    public function show(Request $request, string $id): array
    {
        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            $pdo = null;
        }

        if ($pdo instanceof PDO) {
            $stmt = $pdo->prepare('SELECT j.*, c.name as company_name, c.logo as company_logo, c.industry, c.size as company_size FROM jobs j LEFT JOIN companies c ON j.company_id = c.id WHERE j.id = :id LIMIT 1');
            $stmt->execute(['id' => $id]);
            $row = $stmt->fetch() ?: null;

            if ($row) {
                return ['success' => true, 'data' => $this->mapJobRow($row)];
            }
        }

        // Fallback: search in mock data
        $jobs = $this->fallbackJobs();
        $job = current(array_filter($jobs, static fn (array $j): bool => $j['id'] === $id));

        if ($job) {
            return ['success' => true, 'data' => $job];
        }

        return ['success' => false, 'message' => 'Job not found'];
    }
}

