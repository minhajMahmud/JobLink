<?php

declare(strict_types=1);

namespace App\Modules\Admin\Repositories;

use App\Core\Database\Connection;
use PDO;
use Throwable;

final class AdminRepository
{
    private ?PDO $pdo = null;

    public function __construct()
    {
        try {
            $this->pdo = Connection::getPdo();
        } catch (Throwable) {
            $this->pdo = null;
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getUsers(array $filters, int $page, int $limit): array
    {
        if ($this->pdo instanceof PDO) {
            $query = strtolower(trim((string)($filters['query'] ?? '')));
            $role = strtolower(trim((string)($filters['role'] ?? '')));
            $status = strtolower(trim((string)($filters['status'] ?? '')));

            $where = [];
            $params = [];

            if ($query !== '') {
                $where[] = "(LOWER(aur.user_id) LIKE :query OR LOWER(COALESCE(ar.name, '')) LIKE :query)";
                $params['query'] = '%' . $query . '%';
            }

            if ($role !== '' && $role !== 'all') {
                $where[] = "LOWER(COALESCE(ar.name, '')) = :role";
                $params['role'] = $role;
            }

            $sql = 'SELECT aur.user_id, ar.name AS role_name, aur.assigned_at FROM admin_user_roles aur INNER JOIN admin_roles ar ON ar.id = aur.role_id';
            if ($where !== []) {
                $sql .= ' WHERE ' . implode(' AND ', $where);
            }
            $sql .= ' ORDER BY aur.assigned_at DESC';

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll() ?: [];

            $records = array_map(static function (array $row): array {
                $mappedRole = match (strtolower((string)($row['role_name'] ?? ''))) {
                    'admin' => 'admin',
                    default => 'candidate',
                };

                return [
                    'id' => (string)($row['user_id'] ?? ''),
                    'name' => 'User ' . substr((string)($row['user_id'] ?? ''), 0, 8),
                    'email' => strtolower('user+' . substr((string)($row['user_id'] ?? ''), 0, 8) . '@joblink.local'),
                    'role' => $mappedRole,
                    'status' => 'Active',
                    'joined_at' => substr((string)($row['assigned_at'] ?? date('Y-m-d')), 0, 10),
                ];
            }, $rows);

            if ($status !== '' && $status !== 'all') {
                $records = array_values(array_filter(
                    $records,
                    static fn (array $row): bool => strtolower((string)($row['status'] ?? '')) === $status
                ));
            }

            return $this->paginate($records, $page, $limit);
        }

        $records = [
            ['id' => 'u1', 'name' => 'Alex Morgan', 'email' => 'alex@nexus.demo', 'role' => 'candidate', 'status' => 'Active', 'joined_at' => '2025-10-10'],
            ['id' => 'u2', 'name' => 'James Wilson', 'email' => 'james@cloudscale.io', 'role' => 'recruiter', 'status' => 'Active', 'joined_at' => '2025-08-02'],
            ['id' => 'u3', 'name' => 'Priya Sharma', 'email' => 'priya@designhub.co', 'role' => 'candidate', 'status' => 'Suspended', 'joined_at' => '2026-01-18'],
            ['id' => 'u4', 'name' => 'Morgan Admin', 'email' => 'admin@nexus.demo', 'role' => 'admin', 'status' => 'Active', 'joined_at' => '2024-04-01'],
        ];

        return $this->paginate($this->filterByCommon($records, $filters), $page, $limit);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getEmployers(array $filters, int $page, int $limit): array
    {
        if ($this->pdo instanceof PDO) {
            $query = strtolower(trim((string)($filters['query'] ?? '')));
            $status = strtolower(trim((string)($filters['status'] ?? '')));

            $where = [];
            $params = [];

            if ($query !== '') {
                $where[] = "(LOWER(mj.job_id) LIKE :query OR LOWER(COALESCE(mj.moderated_by, '')) LIKE :query)";
                $params['query'] = '%' . $query . '%';
            }

            if ($status !== '' && $status !== 'all') {
                $where[] = 'LOWER(mj.status) = :status';
                $params['status'] = $status;
            }

            $sql = 'SELECT mj.job_id, mj.status, mj.moderated_by, mj.created_at FROM moderation_jobs mj';
            if ($where !== []) {
                $sql .= ' WHERE ' . implode(' AND ', $where);
            }
            $sql .= ' ORDER BY mj.created_at DESC';

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll() ?: [];

            $records = array_map(static function (array $row): array {
                $jobId = (string)($row['job_id'] ?? '');
                $state = ucfirst(strtolower((string)($row['status'] ?? 'Pending')));
                $isVerified = in_array($state, ['Approved', 'Active'], true);

                return [
                    'id' => $jobId,
                    'company_name' => 'Employer ' . substr($jobId, 0, 6),
                    'email' => strtolower('employer+' . substr($jobId, 0, 6) . '@joblink.local'),
                    'is_verified' => $isVerified,
                    'status' => $state === 'Approved' ? 'Active' : ($state === 'Removed' ? 'Suspended' : 'Pending'),
                    'jobs_posted' => 1,
                ];
            }, $rows);

            return $this->paginate($records, $page, $limit);
        }

        $records = [
            ['id' => 'e1', 'company_name' => 'CloudScale', 'email' => 'ops@cloudscale.io', 'is_verified' => true, 'status' => 'Active', 'jobs_posted' => 12],
            ['id' => 'e2', 'company_name' => 'BrightLabs', 'email' => 'careers@brightlabs.co', 'is_verified' => false, 'status' => 'Pending', 'jobs_posted' => 4],
            ['id' => 'e3', 'company_name' => 'PixelForge', 'email' => 'hiring@pixelforge.studio', 'is_verified' => false, 'status' => 'Suspended', 'jobs_posted' => 1],
        ];

        return $this->paginate($this->filterByCommon($records, $filters, ['company_name', 'email']), $page, $limit);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getPosts(array $filters, int $page, int $limit): array
    {
        if ($this->pdo instanceof PDO) {
            $query = strtolower(trim((string)($filters['query'] ?? '')));
            $status = strtolower(trim((string)($filters['status'] ?? '')));

            $where = [];
            $params = [];

            if ($query !== '') {
                $where[] = 'LOWER(mp.post_id) LIKE :query';
                $params['query'] = '%' . $query . '%';
            }

            if ($status !== '' && $status !== 'all') {
                $where[] = 'LOWER(mp.status) = :status';
                $params['status'] = $status;
            }

            $sql = 'SELECT mp.post_id, mp.status, mp.spam_score, mp.flagged_keywords FROM moderation_posts mp';
            if ($where !== []) {
                $sql .= ' WHERE ' . implode(' AND ', $where);
            }
            $sql .= ' ORDER BY mp.updated_at DESC';

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll() ?: [];

            $records = array_map(static function (array $row): array {
                $keywords = json_decode((string)($row['flagged_keywords'] ?? '[]'), true);
                return [
                    'id' => (string)($row['post_id'] ?? ''),
                    'author_name' => 'Author ' . substr((string)($row['post_id'] ?? ''), 0, 6),
                    'content' => 'Moderated post #' . (string)($row['post_id'] ?? ''),
                    'status' => ucfirst(strtolower((string)($row['status'] ?? 'Pending'))),
                    'spam_score' => (int)round((float)($row['spam_score'] ?? 0)),
                    'flagged_keywords' => is_array($keywords) ? array_values(array_map('strval', $keywords)) : [],
                ];
            }, $rows);

            return $this->paginate($records, $page, $limit);
        }

        $records = [
            ['id' => 'p1', 'author_name' => 'Alex Morgan', 'content' => 'Hiring React devs for remote roles', 'status' => 'Pending', 'spam_score' => 15, 'flagged_keywords' => []],
            ['id' => 'p2', 'author_name' => 'Spam Bot', 'content' => 'earn money fast http://scam.link', 'status' => 'Pending', 'spam_score' => 92, 'flagged_keywords' => ['earn money fast', 'scam.link']],
        ];

        return $this->paginate($this->filterByCommon($records, $filters, ['author_name', 'content', 'status']), $page, $limit);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getJobs(array $filters, int $page, int $limit): array
    {
        if ($this->pdo instanceof PDO) {
            $query = strtolower(trim((string)($filters['query'] ?? '')));
            $status = strtolower(trim((string)($filters['status'] ?? '')));

            $where = [];
            $params = [];

            if ($query !== '') {
                $where[] = 'LOWER(mj.job_id) LIKE :query';
                $params['query'] = '%' . $query . '%';
            }

            if ($status !== '' && $status !== 'all') {
                $where[] = 'LOWER(mj.status) = :status';
                $params['status'] = $status;
            }

            $sql = 'SELECT mj.job_id, mj.status, mj.spam_score FROM moderation_jobs mj';
            if ($where !== []) {
                $sql .= ' WHERE ' . implode(' AND ', $where);
            }
            $sql .= ' ORDER BY mj.updated_at DESC';

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll() ?: [];

            $records = array_map(static function (array $row): array {
                $jobId = (string)($row['job_id'] ?? '');
                return [
                    'id' => $jobId,
                    'title' => 'Job ' . substr($jobId, 0, 8),
                    'company_name' => 'Company ' . substr($jobId, 0, 6),
                    'status' => ucfirst(strtolower((string)($row['status'] ?? 'Pending'))),
                    'spam_score' => (int)round((float)($row['spam_score'] ?? 0)),
                ];
            }, $rows);

            return $this->paginate($records, $page, $limit);
        }

        $records = [
            ['id' => 'j1', 'title' => 'Senior Product Designer', 'company_name' => 'CloudScale', 'status' => 'Pending', 'spam_score' => 8],
            ['id' => 'j2', 'title' => 'Earn $5000/week no experience', 'company_name' => 'Unknown', 'status' => 'Pending', 'spam_score' => 97],
            ['id' => 'j3', 'title' => 'Backend Engineer (PHP)', 'company_name' => 'BrightLabs', 'status' => 'Approved', 'spam_score' => 4],
        ];

        return $this->paginate($this->filterByCommon($records, $filters, ['title', 'company_name', 'status']), $page, $limit);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getReports(array $filters, int $page, int $limit): array
    {
        if ($this->pdo instanceof PDO) {
            $query = strtolower(trim((string)($filters['query'] ?? '')));
            $status = strtolower(trim((string)($filters['status'] ?? '')));
            $priority = strtolower(trim((string)($filters['priority'] ?? '')));

            $where = [];
            $params = [];

            if ($query !== '') {
                $where[] = '(LOWER(ar.details) LIKE :query OR LOWER(ar.category) LIKE :query OR LOWER(ar.entity_type) LIKE :query)';
                $params['query'] = '%' . $query . '%';
            }
            if ($status !== '' && $status !== 'all') {
                $where[] = 'LOWER(ar.status) = :status';
                $params['status'] = $status;
            }
            if ($priority !== '' && $priority !== 'all') {
                $where[] = 'LOWER(ar.priority) = :priority';
                $params['priority'] = $priority;
            }

            $sql = 'SELECT ar.id, ar.category, ar.entity_type, ar.entity_id, ar.details, ar.priority, ar.status FROM admin_reports ar';
            if ($where !== []) {
                $sql .= ' WHERE ' . implode(' AND ', $where);
            }
            $sql .= ' ORDER BY ar.updated_at DESC';

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll() ?: [];

            $records = array_map(static function (array $row): array {
                return [
                    'id' => (string)($row['id'] ?? ''),
                    'category' => (string)($row['category'] ?? 'other'),
                    'entity_type' => (string)($row['entity_type'] ?? 'post'),
                    'entity_id' => (string)($row['entity_id'] ?? ''),
                    'status' => ucfirst(strtolower((string)($row['status'] ?? 'Open'))),
                    'priority' => ucfirst(strtolower((string)($row['priority'] ?? 'Medium'))),
                    'details' => (string)($row['details'] ?? ''),
                ];
            }, $rows);

            return $this->paginate($records, $page, $limit);
        }

        $records = [
            ['id' => 'r1', 'category' => 'spam', 'entity_type' => 'post', 'entity_id' => 'p2', 'status' => 'Open', 'priority' => 'High', 'details' => 'Suspicious repeated links'],
            ['id' => 'r2', 'category' => 'fake_job', 'entity_type' => 'job', 'entity_id' => 'j2', 'status' => 'Investigating', 'priority' => 'High', 'details' => 'Scam-like compensation claim'],
            ['id' => 'r3', 'category' => 'abuse', 'entity_type' => 'user', 'entity_id' => 'u3', 'status' => 'Resolved', 'priority' => 'Medium', 'details' => 'Harassment in messages'],
        ];

        return $this->paginate($this->filterByCommon($records, $filters, ['category', 'entity_type', 'status', 'priority', 'details']), $page, $limit);
    }

    /**
     * @return array<string, mixed>
     */
    public function getAnalytics(string $range): array
    {
        if ($this->pdo instanceof PDO) {
            $kpis = [
                'total_users' => 0,
                'total_employers' => 0,
                'total_jobs' => 0,
                'daily_active_users' => 0,
                'monthly_active_users' => 0,
                'revenue' => 0.0,
            ];

            $kpis['total_users'] = (int)$this->scalar('SELECT COUNT(DISTINCT user_id) FROM admin_user_roles');
            $kpis['total_jobs'] = (int)$this->scalar('SELECT COUNT(*) FROM moderation_jobs');
            $kpis['total_employers'] = (int)$this->scalar('SELECT COUNT(DISTINCT moderated_by) FROM moderation_jobs WHERE moderated_by IS NOT NULL');
            $kpis['daily_active_users'] = (int)$this->scalar('SELECT COUNT(DISTINCT actor_user_id) FROM admin_audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)');
            $kpis['monthly_active_users'] = (int)$this->scalar('SELECT COUNT(DISTINCT actor_user_id) FROM admin_audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');

            $trendStmt = $this->pdo->query(
                'SELECT DATE(created_at) AS day, COUNT(*) AS total FROM admin_audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY day ASC'
            );
            $applicationTrends = [];
            foreach (($trendStmt?->fetchAll() ?: []) as $row) {
                $applicationTrends[] = [
                    'label' => (string)($row['day'] ?? ''),
                    'value' => (int)($row['total'] ?? 0),
                ];
            }

            if ($applicationTrends === []) {
                $applicationTrends = [['label' => date('Y-m-d'), 'value' => 0]];
            }

            return [
                'range' => $range,
                'kpis' => $kpis,
                'application_trends' => $applicationTrends,
                'user_growth' => [
                    ['label' => 'Current', 'users' => $kpis['total_users'], 'employers' => $kpis['total_employers'], 'jobs' => $kpis['total_jobs']],
                ],
            ];
        }

        return [
            'range' => $range,
            'kpis' => [
                'total_users' => 12480,
                'total_employers' => 358,
                'total_jobs' => 684,
                'daily_active_users' => 2480,
                'monthly_active_users' => 8720,
                'revenue' => 14350.40,
            ],
            'application_trends' => [
                ['label' => 'Mon', 'value' => 120],
                ['label' => 'Tue', 'value' => 154],
                ['label' => 'Wed', 'value' => 132],
                ['label' => 'Thu', 'value' => 172],
                ['label' => 'Fri', 'value' => 191],
                ['label' => 'Sat', 'value' => 88],
                ['label' => 'Sun', 'value' => 94],
            ],
            'user_growth' => [
                ['label' => 'Nov', 'users' => 6200, 'employers' => 180, 'jobs' => 320],
                ['label' => 'Dec', 'users' => 7400, 'employers' => 215, 'jobs' => 410],
                ['label' => 'Jan', 'users' => 8650, 'employers' => 248, 'jobs' => 502],
                ['label' => 'Feb', 'users' => 9800, 'employers' => 281, 'jobs' => 560],
                ['label' => 'Mar', 'users' => 11200, 'employers' => 322, 'jobs' => 624],
                ['label' => 'Apr', 'users' => 12480, 'employers' => 358, 'jobs' => 684],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function getRbacMatrix(): array
    {
        if ($this->pdo instanceof PDO) {
            $stmt = $this->pdo->query(
                'SELECT ar.name AS role_name, ap.code AS permission_code FROM admin_role_permissions arp INNER JOIN admin_roles ar ON ar.id = arp.role_id INNER JOIN admin_permissions ap ON ap.id = arp.permission_id ORDER BY ar.name, ap.code'
            );
            $rows = $stmt?->fetchAll() ?: [];

            $roles = [];
            $permissions = [];
            $matrix = [];

            foreach ($rows as $row) {
                $role = (string)($row['role_name'] ?? '');
                $permission = (string)($row['permission_code'] ?? '');
                if ($role === '' || $permission === '') {
                    continue;
                }

                if (!in_array($role, $roles, true)) {
                    $roles[] = $role;
                    $matrix[$role] = [];
                }

                if (!in_array($permission, $permissions, true)) {
                    $permissions[] = $permission;
                }

                $matrix[$role][] = $permission;
            }

            if ($roles !== []) {
                return [
                    'roles' => $roles,
                    'permissions' => $permissions,
                    'matrix' => $matrix,
                ];
            }
        }

        return [
            'roles' => ['admin'],
            'permissions' => [
                'users.view',
                'users.manage',
                'employers.verify',
                'posts.moderate',
                'jobs.moderate',
                'reports.resolve',
                'analytics.view',
                'rbac.manage',
            ],
            'matrix' => [
                'admin' => ['users.view', 'users.manage', 'employers.verify', 'posts.moderate', 'jobs.moderate', 'reports.resolve', 'analytics.view'],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function updateUserStatus(string $userId, string $status, array $actor = []): array
    {
        $normalizedStatus = ucfirst(strtolower($status));
        if (!in_array($normalizedStatus, ['Active', 'Suspended', 'Banned', 'Pending'], true)) {
            $normalizedStatus = 'Pending';
        }

        $payload = [
            'user_id' => $userId,
            'status' => $normalizedStatus,
            'updated_at' => date(DATE_ATOM),
        ];

        $this->logAudit('users.status_updated', 'user', $userId, $payload, $actor);

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public function deleteUser(string $userId, array $actor = []): array
    {
        if ($this->pdo instanceof PDO) {
            $stmt = $this->pdo->prepare('DELETE FROM admin_user_roles WHERE user_id = :user_id');
            $stmt->execute(['user_id' => $userId]);
        }

        $payload = ['deleted' => true, 'user_id' => $userId];
        $this->logAudit('users.deleted', 'user', $userId, $payload, $actor);

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public function verifyEmployer(string $employerId, bool $isVerified, array $actor = []): array
    {
        $status = $isVerified ? 'Approved' : 'Pending';

        if ($this->pdo instanceof PDO) {
            $stmt = $this->pdo->prepare('UPDATE moderation_jobs SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE job_id = :employer_id');
            $stmt->execute([
                'status' => $status,
                'employer_id' => $employerId,
            ]);
        }

        $payload = [
            'employer_id' => $employerId,
            'is_verified' => $isVerified,
            'updated_at' => date(DATE_ATOM),
        ];

        $this->logAudit('employers.verification_updated', 'employer', $employerId, $payload, $actor);

        return $payload;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function moderateEntity(string $module, string $entityId, array $payload, array $actor = []): array
    {
        $status = ucfirst(strtolower((string)($payload['status'] ?? 'Pending')));
        if (!in_array($status, ['Pending', 'Approved', 'Rejected', 'Removed'], true)) {
            $status = 'Pending';
        }

        $note = (string)($payload['moderation_note'] ?? '');
        $table = $module === 'post' ? 'moderation_posts' : 'moderation_jobs';
        $idColumn = $module === 'post' ? 'post_id' : 'job_id';

        if ($this->pdo instanceof PDO) {
            $stmt = $this->pdo->prepare(
                sprintf('UPDATE %s SET status = :status, moderation_note = :note, moderated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE %s = :entity_id', $table, $idColumn)
            );
            $stmt->execute([
                'status' => $status,
                'note' => $note,
                'entity_id' => $entityId,
            ]);
        }

        $result = [
            'module' => $module,
            'entity_id' => $entityId,
            'status' => $status,
            'moderation_note' => $note,
            'moderated_at' => date(DATE_ATOM),
        ];

        $this->logAudit($module . '.moderated', $module, $entityId, $result, $actor);

        return $result;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function resolveReport(string $reportId, array $payload, array $actor = []): array
    {
        $status = ucfirst(strtolower((string)($payload['status'] ?? 'Resolved')));
        if (!in_array($status, ['Open', 'Investigating', 'Resolved', 'Dismissed'], true)) {
            $status = 'Resolved';
        }

        $notes = (string)($payload['admin_notes'] ?? '');

        if ($this->pdo instanceof PDO) {
            $stmt = $this->pdo->prepare("UPDATE admin_reports SET status = :status, admin_notes = :notes, resolved_at = CASE WHEN :status IN ('Resolved', 'Dismissed') THEN CURRENT_TIMESTAMP ELSE resolved_at END, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
            $stmt->execute([
                'status' => $status,
                'notes' => $notes,
                'id' => $reportId,
            ]);
        }

        $result = [
            'report_id' => $reportId,
            'status' => $status,
            'admin_notes' => $notes,
            'resolved_at' => date(DATE_ATOM),
        ];

        $this->logAudit('reports.resolved', 'report', $reportId, $result, $actor);

        return $result;
    }

    /**
     * @return array<string, mixed>
     */
    public function getSpamAlerts(): array
    {
        if ($this->pdo instanceof PDO) {
            $stmt = $this->pdo->query('SELECT entity_type, entity_id, score, risk_level, reason_codes FROM spam_events ORDER BY created_at DESC LIMIT 50');
            $rows = $stmt?->fetchAll() ?: [];

            $alerts = array_map(static function (array $row): array {
                $reasons = json_decode((string)($row['reason_codes'] ?? '[]'), true);
                return [
                    'entity_type' => (string)($row['entity_type'] ?? 'post'),
                    'entity_id' => (string)($row['entity_id'] ?? ''),
                    'score' => (int)round((float)($row['score'] ?? 0)),
                    'risk_level' => ucfirst(strtolower((string)($row['risk_level'] ?? 'Low'))),
                    'reasons' => is_array($reasons) ? array_values(array_map('strval', $reasons)) : [],
                ];
            }, $rows);

            return ['alerts' => $alerts];
        }

        return [
            'alerts' => [
                ['entity_type' => 'post', 'entity_id' => 'p2', 'score' => 92, 'risk_level' => 'High', 'reasons' => ['repeated_links', 'blacklisted_keyword']],
                ['entity_type' => 'job', 'entity_id' => 'j2', 'score' => 97, 'risk_level' => 'High', 'reasons' => ['too_good_to_be_true', 'suspicious_contact']],
                ['entity_type' => 'user', 'entity_id' => 'u3', 'score' => 64, 'risk_level' => 'Medium', 'reasons' => ['mass_messaging']],
            ],
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     * @param array<string, mixed> $filters
     * @param array<int, string> $searchFields
     * @return array<int, array<string, mixed>>
     */
    private function filterByCommon(array $rows, array $filters, array $searchFields = ['name', 'email', 'role', 'status']): array
    {
        $query = strtolower((string)($filters['query'] ?? ''));
        $status = strtolower((string)($filters['status'] ?? ''));
        $role = strtolower((string)($filters['role'] ?? ''));

        return array_values(array_filter($rows, static function (array $row) use ($query, $status, $role, $searchFields): bool {
            if ($query !== '') {
                $matches = false;
                foreach ($searchFields as $field) {
                    if (str_contains(strtolower((string)($row[$field] ?? '')), $query)) {
                        $matches = true;
                        break;
                    }
                }
                if (!$matches) {
                    return false;
                }
            }

            if ($status !== '' && $status !== 'all' && strtolower((string)($row['status'] ?? '')) !== $status) {
                return false;
            }

            if ($role !== '' && $role !== 'all' && strtolower((string)($row['role'] ?? '')) !== $role) {
                return false;
            }

            return true;
        }));
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     * @return array<string, mixed>
     */
    private function paginate(array $rows, int $page, int $limit): array
    {
        $safePage = max(1, $page);
        $safeLimit = max(1, $limit);
        $offset = ($safePage - 1) * $safeLimit;

        return [
            'data' => array_slice($rows, $offset, $safeLimit),
            'meta' => [
                'page' => $safePage,
                'limit' => $safeLimit,
                'total' => count($rows),
                'total_pages' => (int)ceil(max(1, count($rows)) / $safeLimit),
            ],
        ];
    }

    private function scalar(string $sql): mixed
    {
        if (!$this->pdo instanceof PDO) {
            return null;
        }

        $value = $this->pdo->query($sql)?->fetchColumn();

        return $value === false ? null : $value;
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function logAudit(string $actionCode, string $entityType, ?string $entityId, array $payload = [], array $actor = []): void
    {
        if (!$this->pdo instanceof PDO) {
            return;
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO admin_audit_logs (id, actor_user_id, actor_role, action_code, entity_type, entity_id, payload, ip_address, user_agent) VALUES (:id, :actor_user_id, :actor_role, :action_code, :entity_type, :entity_id, :payload, :ip_address, :user_agent)'
        );

        $stmt->execute([
            'id' => $this->generateUuidV4(),
            'actor_user_id' => (string)($actor['id'] ?? 'system'),
            'actor_role' => (string)($actor['role'] ?? 'system'),
            'action_code' => $actionCode,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'payload' => json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'ip_address' => isset($actor['ip_address']) ? (string)$actor['ip_address'] : null,
            'user_agent' => isset($actor['user_agent']) ? (string)$actor['user_agent'] : null,
        ]);
    }

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
