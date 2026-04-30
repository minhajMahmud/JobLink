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

        $candidateId = (string)($candidate['id'] ?? '');

        // Decode JSON fields
        if (isset($candidate['skills']) && is_string($candidate['skills'])) {
            $candidate['skills'] = json_decode($candidate['skills'], true) ?: [];
        }

        // Fetch experience
        $stmt = $pdo->prepare('
            SELECT id, title, company, start_date, end_date, is_current, description 
            FROM candidate_experiences 
            WHERE candidate_id = :candidate_id 
            ORDER BY start_date DESC
        ');
        $stmt->execute(['candidate_id' => $candidateId]);
        $candidate['experience'] = $stmt->fetchAll() ?: [];

        // Fetch education
        $stmt = $pdo->prepare('
            SELECT id, degree, school, field_of_study, start_date, end_date, is_current, description, grade 
            FROM candidate_education 
            WHERE candidate_id = :candidate_id 
            ORDER BY end_date DESC
        ');
        $stmt->execute(['candidate_id' => $candidateId]);
        $candidate['education'] = $stmt->fetchAll() ?: [];

        // Fetch projects
        $stmt = $pdo->prepare('
            SELECT id, title, description, link, start_date, end_date, is_current, technologies, image_url 
            FROM candidate_projects 
            WHERE candidate_id = :candidate_id 
            ORDER BY start_date DESC
        ');
        $stmt->execute(['candidate_id' => $candidateId]);
        $projects = $stmt->fetchAll() ?: [];
        
        // Decode technologies JSON
        foreach ($projects as &$project) {
            if (isset($project['technologies']) && is_string($project['technologies'])) {
                $project['technologies'] = json_decode($project['technologies'], true) ?: [];
            }
        }
        $candidate['projects'] = $projects;

        // Fetch publications
        $stmt = $pdo->prepare('
            SELECT id, title, publisher, publication_date, link, description 
            FROM candidate_publications 
            WHERE candidate_id = :candidate_id 
            ORDER BY publication_date DESC
        ');
        $stmt->execute(['candidate_id' => $candidateId]);
        $candidate['publications'] = $stmt->fetchAll() ?: [];

        // Fetch skill endorsements
        $stmt = $pdo->prepare('
            SELECT skill_name, endorsement_count, top_endorsers 
            FROM candidate_skill_endorsements 
            WHERE candidate_id = :candidate_id 
            ORDER BY endorsement_count DESC
        ');
        $stmt->execute(['candidate_id' => $candidateId]);
        $endorsements = $stmt->fetchAll() ?: [];
        
        // Decode top_endorsers JSON
        $skillsWithEndorsements = [];
        foreach ($endorsements as $endorsement) {
            $topEndorsers = [];
            if (isset($endorsement['top_endorsers']) && is_string($endorsement['top_endorsers'])) {
                $topEndorsers = json_decode($endorsement['top_endorsers'], true) ?: [];
            }
            $skillsWithEndorsements[] = [
                'name' => $endorsement['skill_name'],
                'count' => (int)$endorsement['endorsement_count'],
                'topEndorsers' => is_array($topEndorsers) ? $topEndorsers : []
            ];
        }
        $candidate['skillsWithEndorsements'] = $skillsWithEndorsements;

        // Fetch certifications
        $stmt = $pdo->prepare('
            SELECT id, name, issuer, issue_date, expiration_date, credential_id, credential_url 
            FROM candidate_certifications 
            WHERE candidate_id = :candidate_id 
            ORDER BY issue_date DESC
        ');
        $stmt->execute(['candidate_id' => $candidateId]);
        $candidate['certifications'] = $stmt->fetchAll() ?: [];

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

    // Experience management
    public function addExperience(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $id = $this->generateUuidV4();
        $stmt = $pdo->prepare('
            INSERT INTO candidate_experiences (id, candidate_id, title, company, start_date, end_date, is_current, description)
            VALUES (:id, :candidate_id, :title, :company, :start_date, :end_date, :is_current, :description)
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'title' => $data['title'] ?? '',
            'company' => $data['company'] ?? '',
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => $data['is_current'] ? 1 : 0,
            'description' => $data['description'] ?? '',
        ]);

        return ['success' => true, 'data' => ['id' => $id]];
    }

    public function updateExperience(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('
            UPDATE candidate_experiences
            SET title = :title, company = :company, start_date = :start_date, 
                end_date = :end_date, is_current = :is_current, description = :description
            WHERE id = :id AND candidate_id = :candidate_id
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'title' => $data['title'] ?? '',
            'company' => $data['company'] ?? '',
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => $data['is_current'] ? 1 : 0,
            'description' => $data['description'] ?? '',
        ]);

        return ['success' => true, 'message' => 'Experience updated'];
    }

    public function deleteExperience(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('DELETE FROM candidate_experiences WHERE id = :id AND candidate_id = :candidate_id');
        $stmt->execute(['id' => $id, 'candidate_id' => $candidateId]);

        return ['success' => true, 'message' => 'Experience deleted'];
    }

    // Education management
    public function addEducation(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $id = $this->generateUuidV4();
        $stmt = $pdo->prepare('
            INSERT INTO candidate_education (id, candidate_id, degree, school, field_of_study, start_date, end_date, is_current, description, grade)
            VALUES (:id, :candidate_id, :degree, :school, :field_of_study, :start_date, :end_date, :is_current, :description, :grade)
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'degree' => $data['degree'] ?? '',
            'school' => $data['school'] ?? '',
            'field_of_study' => $data['field_of_study'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => $data['is_current'] ? 1 : 0,
            'description' => $data['description'] ?? '',
            'grade' => $data['grade'] ?? null,
        ]);

        return ['success' => true, 'data' => ['id' => $id]];
    }

    public function updateEducation(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('
            UPDATE candidate_education
            SET degree = :degree, school = :school, field_of_study = :field_of_study,
                start_date = :start_date, end_date = :end_date, is_current = :is_current, 
                description = :description, grade = :grade
            WHERE id = :id AND candidate_id = :candidate_id
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'degree' => $data['degree'] ?? '',
            'school' => $data['school'] ?? '',
            'field_of_study' => $data['field_of_study'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => $data['is_current'] ? 1 : 0,
            'description' => $data['description'] ?? '',
            'grade' => $data['grade'] ?? null,
        ]);

        return ['success' => true, 'message' => 'Education updated'];
    }

    public function deleteEducation(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('DELETE FROM candidate_education WHERE id = :id AND candidate_id = :candidate_id');
        $stmt->execute(['id' => $id, 'candidate_id' => $candidateId]);

        return ['success' => true, 'message' => 'Education deleted'];
    }

    // Projects management
    public function addProject(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $id = $this->generateUuidV4();
        $technologiesJson = json_encode($data['technologies'] ?? []);
        $stmt = $pdo->prepare('
            INSERT INTO candidate_projects (id, candidate_id, title, description, link, start_date, end_date, is_current, technologies, image_url)
            VALUES (:id, :candidate_id, :title, :description, :link, :start_date, :end_date, :is_current, :technologies, :image_url)
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'title' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'link' => $data['link'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => $data['is_current'] ? 1 : 0,
            'technologies' => $technologiesJson,
            'image_url' => $data['image_url'] ?? null,
        ]);

        return ['success' => true, 'data' => ['id' => $id]];
    }

    public function updateProject(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $technologiesJson = json_encode($data['technologies'] ?? []);
        $stmt = $pdo->prepare('
            UPDATE candidate_projects
            SET title = :title, description = :description, link = :link, start_date = :start_date,
                end_date = :end_date, is_current = :is_current, technologies = :technologies, image_url = :image_url
            WHERE id = :id AND candidate_id = :candidate_id
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'title' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'link' => $data['link'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => $data['is_current'] ? 1 : 0,
            'technologies' => $technologiesJson,
            'image_url' => $data['image_url'] ?? null,
        ]);

        return ['success' => true, 'message' => 'Project updated'];
    }

    public function deleteProject(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('DELETE FROM candidate_projects WHERE id = :id AND candidate_id = :candidate_id');
        $stmt->execute(['id' => $id, 'candidate_id' => $candidateId]);

        return ['success' => true, 'message' => 'Project deleted'];
    }

    // Publications management
    public function addPublication(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $id = $this->generateUuidV4();
        $stmt = $pdo->prepare('
            INSERT INTO candidate_publications (id, candidate_id, title, publisher, publication_date, link, description)
            VALUES (:id, :candidate_id, :title, :publisher, :publication_date, :link, :description)
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'title' => $data['title'] ?? '',
            'publisher' => $data['publisher'] ?? null,
            'publication_date' => $data['publication_date'] ?? null,
            'link' => $data['link'] ?? null,
            'description' => $data['description'] ?? '',
        ]);

        return ['success' => true, 'data' => ['id' => $id]];
    }

    public function updatePublication(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('
            UPDATE candidate_publications
            SET title = :title, publisher = :publisher, publication_date = :publication_date, 
                link = :link, description = :description
            WHERE id = :id AND candidate_id = :candidate_id
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'title' => $data['title'] ?? '',
            'publisher' => $data['publisher'] ?? null,
            'publication_date' => $data['publication_date'] ?? null,
            'link' => $data['link'] ?? null,
            'description' => $data['description'] ?? '',
        ]);

        return ['success' => true, 'message' => 'Publication updated'];
    }

    public function deletePublication(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('DELETE FROM candidate_publications WHERE id = :id AND candidate_id = :candidate_id');
        $stmt->execute(['id' => $id, 'candidate_id' => $candidateId]);

        return ['success' => true, 'message' => 'Publication deleted'];
    }

    // Certifications management
    public function addCertification(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $id = $this->generateUuidV4();
        $stmt = $pdo->prepare('
            INSERT INTO candidate_certifications (id, candidate_id, name, issuer, issue_date, expiration_date, credential_id, credential_url)
            VALUES (:id, :candidate_id, :name, :issuer, :issue_date, :expiration_date, :credential_id, :credential_url)
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'name' => $data['name'] ?? '',
            'issuer' => $data['issuer'] ?? null,
            'issue_date' => $data['issue_date'] ?? null,
            'expiration_date' => $data['expiration_date'] ?? null,
            'credential_id' => $data['credential_id'] ?? null,
            'credential_url' => $data['credential_url'] ?? null,
        ]);

        return ['success' => true, 'data' => ['id' => $id]];
    }

    public function updateCertification(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('
            UPDATE candidate_certifications
            SET name = :name, issuer = :issuer, issue_date = :issue_date, 
                expiration_date = :expiration_date, credential_id = :credential_id, credential_url = :credential_url
            WHERE id = :id AND candidate_id = :candidate_id
        ');

        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'name' => $data['name'] ?? '',
            'issuer' => $data['issuer'] ?? null,
            'issue_date' => $data['issue_date'] ?? null,
            'expiration_date' => $data['expiration_date'] ?? null,
            'credential_id' => $data['credential_id'] ?? null,
            'credential_url' => $data['credential_url'] ?? null,
        ]);

        return ['success' => true, 'message' => 'Certification updated'];
    }

    public function deleteCertification(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $id = (string)$request->route('id');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $stmt = $pdo->prepare('DELETE FROM candidate_certifications WHERE id = :id AND candidate_id = :candidate_id');
        $stmt->execute(['id' => $id, 'candidate_id' => $candidateId]);

        return ['success' => true, 'message' => 'Certification deleted'];
    }

    // Skills endorsements
    public function endorseSkill(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');
        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => false, 'message' => 'Candidate not found'];
        }

        $skillName = $data['skill_name'] ?? '';
        $stmt = $pdo->prepare('
            INSERT INTO candidate_skill_endorsements (id, candidate_id, skill_name, endorsement_count, last_endorsed_at)
            VALUES (:id, :candidate_id, :skill_name, 1, NOW())
            ON DUPLICATE KEY UPDATE 
                endorsement_count = endorsement_count + 1,
                last_endorsed_at = NOW()
        ');

        $stmt->execute([
            'id' => $this->generateUuidV4(),
            'candidate_id' => $candidateId,
            'skill_name' => $skillName,
        ]);

        return ['success' => true, 'message' => 'Skill endorsed'];
    }

    public function getSkillEndorsements(Request $request): array
    {
        $userId = (string)($request->user('id') ?? 'local-seeker');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable', 'data' => []];
        }

        $candidateId = $this->resolveCandidateId($pdo, $userId);
        if (!$candidateId) {
            return ['success' => true, 'data' => []];
        }

        $stmt = $pdo->prepare('
            SELECT skill_name, endorsement_count, top_endorsers
            FROM candidate_skill_endorsements
            WHERE candidate_id = :candidate_id
            ORDER BY endorsement_count DESC
        ');
        $stmt->execute(['candidate_id' => $candidateId]);
        $endorsements = $stmt->fetchAll() ?: [];

        return ['success' => true, 'data' => $endorsements];
    }
}
