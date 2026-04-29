<?php

declare(strict_types=1);

namespace App\Modules\User\Controllers;

use App\Core\Database\Connection;
use App\Core\Http\Request;
use PDO;
use Throwable;

final class CandidateController
{
    private function resolveCandidateId(PDO $pdo, string $userId): ?string
    {
        $stmt = $pdo->prepare('SELECT id FROM candidates WHERE user_id = :user_id LIMIT 1');
        $stmt->execute(['user_id' => $userId]);
        $candidateId = $stmt->fetchColumn();

        return $candidateId === false ? null : (string)$candidateId;
    }

    public function getProfile(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable', 'data' => null];
        }

        $stmt = $pdo->prepare('SELECT * FROM candidates WHERE user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
        $candidate = $stmt->fetch() ?: null;

        if (!$candidate) {
            return ['success' => false, 'message' => 'Profile not found', 'data' => null];
        }

        if (isset($candidate['skills']) && is_string($candidate['skills'])) {
            $candidate['skills'] = json_decode($candidate['skills'], true) ?: [];
        }

        return ['success' => true, 'data' => $candidate];
    }

    public function saveProfile(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');

        $data = $request->json();
        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $skillsJson = json_encode($data['skills'] ?? []);

        $stmt = $pdo->prepare('
            INSERT INTO candidates (user_id, bio, skills, experience_years, education_level, location, availability_status, avatar_url)
            VALUES (:user_id, :bio, :skills, :experience_years, :education_level, :location, :availability_status, :avatar_url)
            ON DUPLICATE KEY UPDATE 
                bio = VALUES(bio), 
                skills = VALUES(skills),
                experience_years = VALUES(experience_years),
                education_level = VALUES(education_level),
                location = VALUES(location),
                availability_status = VALUES(availability_status),
                avatar_url = VALUES(avatar_url)
        ');

        $stmt->execute([
            'user_id' => $userId,
            'bio' => $data['bio'] ?? '',
            'skills' => $skillsJson,
            'experience_years' => $data['experience_years'] ?? 0,
            'education_level' => $data['education_level'] ?? 'Bachelor',
            'location' => $data['location'] ?? '',
            'availability_status' => $data['availability_status'] ?? 'Actively Looking',
            'avatar_url' => $data['avatar_url'] ?? null
        ]);

        return ['success' => true, 'message' => 'Profile saved successfully'];
    }

    public function getResume(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable', 'data' => null];
        }

        $stmt = $pdo->prepare('SELECT * FROM candidate_resumes WHERE user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
        $resume = $stmt->fetch() ?: null;

        if (!$resume) {
            return ['success' => false, 'message' => 'Resume not found', 'data' => null];
        }

        if (isset($resume['personal_info']) && is_string($resume['personal_info'])) {
            $resume['personal_info'] = json_decode($resume['personal_info'], true) ?: [];
        }
        if (isset($resume['headers']) && is_string($resume['headers'])) {
            $resume['headers'] = json_decode($resume['headers'], true) ?: [];
        }
        if (isset($resume['sections']) && is_string($resume['sections'])) {
            $resume['sections'] = json_decode($resume['sections'], true) ?: [];
        }

        return ['success' => true, 'data' => $resume];
    }

    public function saveResume(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $data = $request->json();

        $theme = $data['theme'] ?? 'executive';
        $includeAvatar = $data['include_avatar'] ?? false;
        $personalInfo = json_encode($data['personal_info'] ?? []);
        $summary = $data['summary'] ?? '';
        $skills = $data['skills'] ?? '';
        $languages = $data['languages'] ?? '';
        $headers = json_encode($data['headers'] ?? []);
        $sections = json_encode($data['sections'] ?? []);

        $stmt = $pdo->prepare('
            INSERT INTO candidate_resumes (user_id, theme, include_avatar, personal_info, summary, skills, languages, headers, sections)
            VALUES (:user_id, :theme, :include_avatar, :personal_info, :summary, :skills, :languages, :headers, :sections)
            ON DUPLICATE KEY UPDATE 
                theme = VALUES(theme), 
                include_avatar = VALUES(include_avatar),
                personal_info = VALUES(personal_info),
                summary = VALUES(summary),
                skills = VALUES(skills),
                languages = VALUES(languages),
                headers = VALUES(headers),
                sections = VALUES(sections)
        ');

        $stmt->execute([
            'user_id' => $userId,
            'theme' => $theme,
            'include_avatar' => $includeAvatar ? 1 : 0,
            'personal_info' => $personalInfo,
            'summary' => $summary,
            'skills' => $skills,
            'languages' => $languages,
            'headers' => $headers,
            'sections' => $sections
        ]);

        return ['success' => true, 'message' => 'Resume saved successfully'];
    }

    public function getApplications(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => true, 'data' => [], 'meta' => ['total' => 0]];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if ($candidateId === null) {
            return ['success' => true, 'data' => [], 'meta' => ['total' => 0]];
        }

        $stmt = $pdo->prepare(
            'SELECT ja.id, ja.job_id, ja.status, ja.match_score, ja.notes, ja.applied_at, ja.updated_at,
                    j.title, j.location, j.remote_policy, j.salary_min, j.salary_max, j.type, j.level, j.required_skills, j.description, j.created_at,
                    c.name AS company_name, c.logo AS company_logo, c.industry, c.size AS company_size
             FROM job_applications ja
             INNER JOIN jobs j ON j.id = ja.job_id
             INNER JOIN companies c ON c.id = j.company_id
             WHERE ja.candidate_id = :candidate_id
             ORDER BY ja.updated_at DESC'
        );
        $stmt->execute(['candidate_id' => $candidateId]);
        $rows = $stmt->fetchAll() ?: [];

        $data = array_map(function (array $row): array {
            $appliedAtTs = strtotime((string)($row['applied_at'] ?? 'now')) ?: time();
            $updatedAtTs = strtotime((string)($row['updated_at'] ?? 'now')) ?: time();
            $uiStatus = $this->mapApplicationStatusToUi((string)($row['status'] ?? 'Applied'));

            return [
                'id' => (string)($row['id'] ?? ''),
                'jobId' => (string)($row['job_id'] ?? ''),
                'job' => [
                    'id' => (string)($row['job_id'] ?? ''),
                    'title' => (string)($row['title'] ?? ''),
                    'company' => (string)($row['company_name'] ?? ''),
                    'companyLogo' => (string)($row['company_logo'] ?? 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=120&h=120&fit=crop'),
                    'location' => (string)($row['location'] ?? ''),
                    'remotePolicy' => ucfirst(strtolower((string)($row['remote_policy'] ?? 'Hybrid'))),
                    'industry' => (string)($row['industry'] ?? ''),
                    'companySize' => (string)($row['company_size'] ?? '51-200'),
                    'salary' => ((int)($row['salary_min'] ?? 0) > 0 && (int)($row['salary_max'] ?? 0) > 0)
                        ? sprintf('$%dk - $%dk', (int)$row['salary_min'], (int)$row['salary_max'])
                        : 'Negotiable',
                    'salaryMin' => (int)($row['salary_min'] ?? 0),
                    'salaryMax' => (int)($row['salary_max'] ?? 0),
                    'type' => (string)($row['type'] ?? 'Full-time'),
                    'experienceLevel' => ucfirst((string)($row['level'] ?? 'Mid')),
                    'description' => (string)($row['description'] ?? ''),
                    'requirements' => [],
                    'skills' => [],
                    'benefits' => [],
                    'visaSupport' => false,
                    'urgentHiring' => false,
                    'postedAt' => date('M d, Y', $updatedAtTs),
                    'postedAtISO' => date(DATE_ATOM, $updatedAtTs),
                    'applicants' => 0,
                ],
                'appliedAt' => date('M d, Y', $appliedAtTs),
                'status' => $uiStatus,
                'statusHistory' => [
                    ['status' => 'Applied', 'date' => date('M d, Y', $appliedAtTs)],
                    ['status' => $uiStatus, 'date' => date('M d, Y', $updatedAtTs)],
                ],
            ];
        }, $rows);

        return ['success' => true, 'data' => $data, 'meta' => ['total' => count($data)]];
    }

    public function applyToJob(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $payload = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if ($candidateId === null) {
            return ['success' => false, 'message' => 'Candidate profile not found'];
        }

        $jobId = (string)($payload['job_id'] ?? $payload['jobId'] ?? '');
        if ($jobId === '') {
            return ['success' => false, 'message' => 'Job ID is required'];
        }

        $existing = $pdo->prepare('SELECT id FROM job_applications WHERE job_id = :job_id AND candidate_id = :candidate_id LIMIT 1');
        $existing->execute(['job_id' => $jobId, 'candidate_id' => $candidateId]);
        $existingId = $existing->fetchColumn();
        if ($existingId !== false) {
            return ['success' => true, 'message' => 'Already applied', 'data' => ['id' => (string)$existingId, 'job_id' => $jobId]];
        }

        $stmt = $pdo->prepare(
            'INSERT INTO job_applications (id, job_id, candidate_id, status, match_score, notes)
             VALUES (:id, :job_id, :candidate_id, :status, :match_score, :notes)'
        );
        $stmt->execute([
            'id' => $this->generateUuidV4(),
            'job_id' => $jobId,
            'candidate_id' => $candidateId,
            'status' => 'Applied',
            'match_score' => 0,
            'notes' => (string)($payload['cover_letter'] ?? $payload['coverLetter'] ?? ''),
        ]);

        return ['success' => true, 'message' => 'Application submitted'];
    }

    public function updateApplicationStatus(Request $request, string $id): array
    {
        $payload = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $stmt = $pdo->prepare('UPDATE job_applications SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        $stmt->execute([
            'status' => $this->mapApplicationStatusToDb((string)($payload['status'] ?? 'Applied')),
            'id' => $id,
        ]);

        return ['success' => true, 'message' => 'Application updated', 'data' => ['id' => $id]];
    }

    private function mapApplicationStatusToDb(string $status): string
    {
        return match ($status) {
            'Shortlisted' => 'Reviewed',
            'Interview' => 'Interview',
            'Hired' => 'Hired',
            'Rejected' => 'Rejected',
            default => 'Applied',
        };
    }

    private function mapApplicationStatusToUi(string $status): string
    {
        return match ($status) {
            'Reviewed' => 'Shortlisted',
            'Interview' => 'Interview',
            'Hired' => 'Hired',
            'Rejected' => 'Rejected',
            default => 'Applied',
        };
    }

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
