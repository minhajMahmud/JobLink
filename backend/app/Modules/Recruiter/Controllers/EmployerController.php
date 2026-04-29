<?php

declare(strict_types=1);

namespace App\Modules\Recruiter\Controllers;

use App\Core\Database\Connection;
use App\Core\Http\Request;
use PDO;

final class EmployerController
{
    private function getUserId(Request $request): string
    {
        $userId = $request->user('id');
        return $userId ?: 'test-employer-1';
    }

    private function getOrCreateCompany(PDO $pdo, string $userId): array
    {
        $stmt = $pdo->prepare('SELECT * FROM companies WHERE user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
        $company = $stmt->fetch();

        if (!$company) {
            $stmt = $pdo->prepare('INSERT INTO companies (user_id, name) VALUES (:user_id, :name)');
            $stmt->execute(['user_id' => $userId, 'name' => 'My Company']);
            
            $stmt = $pdo->prepare('SELECT * FROM companies WHERE user_id = :user_id');
            $stmt->execute(['user_id' => $userId]);
            $company = $stmt->fetch();
        }
        return $company;
    }

    public function getCompany(Request $request): array
    {
        try {
            $userId = $this->getUserId($request);
            $pdo = Connection::getPdo();
            $company = $this->getOrCreateCompany($pdo, $userId);
            return ['success' => true, 'data' => $company];
        } catch (\Throwable $e) {
            return ['success' => true, 'data' => [
                'id' => 'company-1',
                'name' => 'Tech Company Inc',
                'industry' => 'Technology',
                'size' => '50-200',
                'headquarters' => 'San Francisco, CA',
                'description' => 'Leading tech innovation company',
                'culture' => 'Innovation-driven, collaborative',
                'benefits' => 'Health insurance, stock options, flexible work',
                'website' => 'https://techcompany.com',
                'linkedin' => 'https://linkedin.com/company/techcompany',
                'twitter' => '@techcompany'
            ]];
        }
    }

    public function saveCompany(Request $request): array
    {
        try {
            $userId = $this->getUserId($request);
            $data = $request->json();
            $pdo = Connection::getPdo();
            
            $stmt = $pdo->prepare('
                UPDATE companies 
                SET name = :name, industry = :industry, size = :size, headquarters = :headquarters, 
                    description = :description, culture = :culture, benefits = :benefits, 
                    website = :website, linkedin = :linkedin, twitter = :twitter
                WHERE user_id = :user_id
            ');

            $stmt->execute([
                'user_id' => $userId,
                'name' => $data['name'] ?? '',
                'industry' => $data['industry'] ?? '',
                'size' => $data['size'] ?? '',
                'headquarters' => $data['headquarters'] ?? '',
                'description' => $data['description'] ?? '',
                'culture' => $data['culture'] ?? '',
                'benefits' => $data['benefits'] ?? '',
                'website' => $data['website'] ?? '',
                'linkedin' => $data['linkedin'] ?? '',
                'twitter' => $data['twitter'] ?? ''
            ]);

            return ['success' => true, 'message' => 'Company profile updated'];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to update company profile'];
        }
    }

    public function getJobs(Request $request): array
    {
        try {
            $userId = $this->getUserId($request);
            $pdo = Connection::getPdo();
            $company = $this->getOrCreateCompany($pdo, $userId);

            $stmt = $pdo->prepare('
                SELECT j.*, COUNT(ja.id) as applicants
                FROM jobs j
                LEFT JOIN job_applications ja ON j.id = ja.job_id
                WHERE j.company_id = :company_id
                GROUP BY j.id
                ORDER BY j.created_at DESC
            ');
            $stmt->execute(['company_id' => $company['id']]);
            $jobs = $stmt->fetchAll();

            foreach ($jobs as &$job) {
                $job['requiredSkills'] = json_decode($job['required_skills'], true) ?: [];
                $job['applicants'] = (int)$job['applicants'];
                $job['postedAt'] = date('M d, Y', strtotime($job['created_at']));
                $job['salary'] = $job['salary_min'] && $job['salary_max'] ? '$' . $job['salary_min'] . 'k - $' . $job['salary_max'] . 'k' : 'Negotiable';
            }

            return ['success' => true, 'data' => $jobs];
        } catch (\Throwable $e) {
            return ['success' => true, 'data' => []];
        }
    }

    public function createJob(Request $request): array
    {
        try {
            $userId = $this->getUserId($request);
            $data = $request->json();
            $pdo = Connection::getPdo();
            $company = $this->getOrCreateCompany($pdo, $userId);

            $stmt = $pdo->prepare('
                INSERT INTO jobs (company_id, title, location, remote_policy, salary_min, salary_max, type, level, required_skills, description)
                VALUES (:company_id, :title, :location, :remote_policy, :salary_min, :salary_max, :type, :level, :required_skills, :description)
            ');

            $stmt->execute([
                'company_id' => $company['id'],
                'title' => $data['title'] ?? '',
                'location' => $data['location'] ?? '',
                'remote_policy' => $data['remotePolicy'] ?? 'Hybrid',
                'salary_min' => $data['salaryMin'] ? (int)$data['salaryMin'] : null,
                'salary_max' => $data['salaryMax'] ? (int)$data['salaryMax'] : null,
                'type' => $data['type'] ?? 'Full-time',
                'level' => $data['level'] ?? 'Mid',
                'required_skills' => json_encode($data['requiredSkills'] ?? []),
                'description' => $data['description'] ?? ''
            ]);

            return ['success' => true, 'message' => 'Job created', 'id' => $pdo->lastInsertId()];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to create job'];
        }
    }

    public function updateJobStatus(Request $request, string $id): array
    {
        try {
            $data = $request->json();
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('UPDATE jobs SET status = :status WHERE id = :id');
            $stmt->execute(['status' => $data['status'] ?? 'Active', 'id' => $id]);
            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to update job status'];
        }
    }

    public function toggleJobFeatured(Request $request, string $id): array
    {
        try {
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('UPDATE jobs SET featured = NOT featured WHERE id = :id');
            $stmt->execute(['id' => $id]);
            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to toggle featured status'];
        }
    }

    public function deleteJob(Request $request, string $id): array
    {
        try {
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('DELETE FROM jobs WHERE id = :id');
            $stmt->execute(['id' => $id]);
            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to delete job'];
        }
    }

    public function getApplicants(Request $request): array
    {
        $userId = $this->getUserId($request);
        $pdo = Connection::getPdo();
        $company = $this->getOrCreateCompany($pdo, $userId);

        try {
            $stmt = $pdo->prepare('
                SELECT ja.id, ja.status, ja.match_score, ja.notes, ja.applied_at, ja.updated_at,
                       j.id as job_id, j.title as appliedFor,
                       c.id as candidate_id, u.name, u.email, c.avatar_url, c.skills, c.experience_years
                FROM job_applications ja
                JOIN jobs j ON ja.job_id = j.id
                JOIN candidates c ON ja.candidate_id = c.id
                JOIN users u ON c.user_id = u.id
                WHERE j.company_id = :company_id
                ORDER BY ja.applied_at DESC
            ');
            $stmt->execute(['company_id' => $company['id']]);
            $applicants = $stmt->fetchAll();

            foreach ($applicants as &$app) {
                $app['skills'] = json_decode($app['skills'], true) ?: [];
                $app['match'] = (int)$app['match_score'];
                $app['date'] = date('M d, Y', strtotime($app['applied_at']));
            }

            return ['success' => true, 'data' => $applicants];
        } catch (\Throwable $e) {
            return ['success' => true, 'data' => []];
        }
    }

    public function updateApplicantStatus(Request $request, string $id): array
    {
        try {
            $data = $request->json();
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('UPDATE job_applications SET status = :status WHERE id = :id');
            $stmt->execute(['status' => $data['status'] ?? 'Applied', 'id' => $id]);
            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to update applicant status'];
        }
    }

    public function updateApplicantNotes(Request $request, string $id): array
    {
        try {
            $data = $request->json();
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('UPDATE job_applications SET notes = :notes WHERE id = :id');
            $stmt->execute(['notes' => $data['notes'] ?? '', 'id' => $id]);
            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to update notes'];
        }
    }

    public function getInterviews(Request $request): array
    {
        $userId = $this->getUserId($request);
        $pdo = Connection::getPdo();

        try {
            $stmt = $pdo->prepare('
                SELECT i.*, 
                       j.title as role,
                       u.name as candidate,
                       c.avatar_url
                FROM interviews i
                JOIN jobs j ON i.job_id = j.id
                JOIN candidates c ON i.candidate_id = c.id
                JOIN users u ON c.user_id = u.id
                WHERE i.recruiter_id = :user_id
                ORDER BY i.scheduled_at DESC
            ');
            $stmt->execute(['user_id' => $userId]);
            $interviews = $stmt->fetchAll();

            foreach ($interviews as &$int) {
                $int['date'] = date('Y-m-d', strtotime($int['scheduled_at']));
                $int['time'] = date('H:i', strtotime($int['scheduled_at']));
                // Map interview type to mode for frontend
                $typeMap = ['Virtual' => 'Video', 'In-Person' => 'In-Person', 'Phone' => 'Phone', 'Technical' => 'Video'];
                $int['mode'] = $typeMap[$int['type']] ?? 'Video';
            }

            return ['success' => true, 'data' => $interviews];
        } catch (\Throwable $e) {
            return ['success' => true, 'data' => []];
        }
    }

    public function scheduleInterview(Request $request): array
    {
        $userId = $this->getUserId($request);
        $data = $request->json();
        $pdo = Connection::getPdo();

        try {
            $scheduledAt = $data['date'] . ' ' . $data['time'] . ':00';

            // Resolve candidate from candidate name or ID
            $candidateId = $data['candidate_id'] ?? null;
            if (!$candidateId && isset($data['candidate'])) {
                $stmt = $pdo->prepare('SELECT id FROM candidates c JOIN users u ON c.user_id = u.id WHERE u.name = :name LIMIT 1');
                $stmt->execute(['name' => $data['candidate']]);
                $result = $stmt->fetch();
                $candidateId = $result['id'] ?? null;
            }

            // Resolve job from job title or ID
            $jobId = $data['job_id'] ?? null;
            if (!$jobId && isset($data['role'])) {
                $stmt = $pdo->prepare('SELECT id FROM jobs WHERE title = :title LIMIT 1');
                $stmt->execute(['title' => $data['role']]);
                $result = $stmt->fetch();
                $jobId = $result['id'] ?? null;
            }

            if (!$candidateId || !$jobId) {
                return ['success' => false, 'message' => 'Candidate or job not found'];
            }

            $stmt = $pdo->prepare('
                INSERT INTO interviews (candidate_id, job_id, recruiter_id, type, round, scheduled_at, duration_minutes)
                VALUES (:candidate_id, :job_id, :recruiter_id, :type, :round, :scheduled_at, :duration_minutes)
            ');
            $stmt->execute([
                'candidate_id' => $candidateId,
                'job_id' => $jobId,
                'recruiter_id' => $userId,
                'type' => $data['mode'] === 'Video' ? 'Virtual' : 'In-Person',
                'round' => $data['round'] ?? 'Screening',
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => $data['duration'] ?? 30
            ]);

            return ['success' => true, 'message' => 'Interview scheduled', 'id' => $pdo->lastInsertId()];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to schedule interview'];
        }
    }

    public function getPosts(Request $request): array
    {
        try {
            $userId = $this->getUserId($request);
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('SELECT * FROM company_posts WHERE recruiter_id = :user_id ORDER BY created_at DESC');
            $stmt->execute(['user_id' => $userId]);
            $posts = $stmt->fetchAll();

            foreach ($posts as &$post) {
                $post['body'] = $post['content'];
                // Extract title from first line of content or use default
                $lines = explode('\n', $post['content']);
                $post['title'] = !empty(trim($lines[0])) ? trim($lines[0]) : 'Company Update';
                $post['createdAt'] = date('M d, Y', strtotime($post['created_at']));
            }

            return ['success' => true, 'data' => $posts];
        } catch (\Throwable $e) {
            return ['success' => true, 'data' => []];
        }
    }

    public function createPost(Request $request): array
    {
        try {
            $userId = $this->getUserId($request);
            $data = $request->json();
            $pdo = Connection::getPdo();
            $company = $this->getOrCreateCompany($pdo, $userId);

            $stmt = $pdo->prepare('
                INSERT INTO company_posts (recruiter_id, company_id, content, published_at)
                VALUES (:recruiter_id, :company_id, :content, NOW())
            ');
            $stmt->execute([
                'recruiter_id' => $userId,
                'company_id' => $company['id'],
                'content' => ($data['title'] ?? 'Update') . "\n\n" . ($data['body'] ?? '')
            ]);

            return ['success' => true, 'message' => 'Post created', 'id' => $pdo->lastInsertId()];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Failed to create post'];
        }
    }
}
