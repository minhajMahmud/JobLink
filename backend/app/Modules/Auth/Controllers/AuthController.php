<?php

declare(strict_types=1);

namespace App\Modules\Auth\Controllers;

use App\Core\Database\Connection;
use App\Core\Http\Request;
use PDO;
use Throwable;

final class AuthController
{
    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Build a simple signed JWT (HS256).
     * Uses APP_SECRET from env; falls back to a default for local dev.
     */
    private function buildJwt(string $userId, string $role, string $name, string $email): string
    {
        $secret = (string)(getenv('APP_SECRET') ?: 'joblink-dev-secret-change-in-production');

        $header  = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode([
            'sub'   => $userId,
            'role'  => $role,
            'name'  => $name,
            'email' => $email,
            'iat'   => time(),
            'exp'   => time() + 60 * 60 * 24 * 7, // 7 days
        ]));

        $header  = rtrim(strtr($header, '+/', '-_'), '=');
        $payload = rtrim(strtr($payload, '+/', '-_'), '=');

        $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)), '+/', '-_'), '=');

        return "$header.$payload.$sig";
    }

    private function mapDbRoleToUi(string $dbRole): string
    {
        return match (strtolower($dbRole)) {
            'recruiter' => 'employer',
            'admin'     => 'admin',
            default     => 'seeker',
        };
    }

    // -------------------------------------------------------------------------
    // POST /auth/login
    // -------------------------------------------------------------------------
    public function login(Request $request): array
    {
        $data     = $request->json();
        $email    = strtolower(trim((string)($data['email'] ?? '')));
        $password = (string)($data['password'] ?? '');

        if ($email === '' || $password === '') {
            return ['success' => false, 'message' => 'Email and password are required'];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable $e) {
            error_log("Database connection error: " . $e->getMessage());
            error_log("Database connection error trace: " . $e->getTraceAsString());
            return ['success' => false, 'message' => 'Database unavailable', 'debug' => $e->getMessage()];
        }

        $stmt = $pdo->prepare(
            'SELECT id, email, password, first_name, last_name, role, status
             FROM users WHERE email = :email LIMIT 1'
        );
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

        if ((string)($user['status'] ?? '') === 'Suspended') {
            return ['success' => false, 'message' => 'Account suspended'];
        }

        if (!password_verify($password, (string)($user['password'] ?? ''))) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }

        // Fetch avatar from candidates table if available
        $avatarStmt = $pdo->prepare('SELECT avatar_url FROM candidates WHERE user_id = :uid LIMIT 1');
        $avatarStmt->execute(['uid' => $user['id']]);
        $avatarRow = $avatarStmt->fetch();
        $avatar = ($avatarRow && $avatarRow['avatar_url']) ? (string)$avatarRow['avatar_url']
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';

        $name   = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
        $uiRole = $this->mapDbRoleToUi((string)($user['role'] ?? 'Candidate'));
        $token  = $this->buildJwt((string)$user['id'], $uiRole, $name, $email);

        return [
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'     => (string)$user['id'],
                'name'   => $name,
                'email'  => $email,
                'role'   => $uiRole,
                'avatar' => $avatar,
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // POST /auth/register
    // -------------------------------------------------------------------------
    public function register(Request $request): array
    {
        $data      = $request->json();
        $email     = strtolower(trim((string)($data['email'] ?? '')));
        $password  = (string)($data['password'] ?? '');
        $firstName = trim((string)($data['first_name'] ?? $data['firstName'] ?? ''));
        $lastName  = trim((string)($data['last_name'] ?? $data['lastName'] ?? ''));
        $role      = (string)($data['role'] ?? 'Candidate');

        if ($email === '' || $password === '' || $firstName === '') {
            return ['success' => false, 'message' => 'Email, password, and first name are required'];
        }

        if (strlen($password) < 8) {
            return ['success' => false, 'message' => 'Password must be at least 8 characters'];
        }

        $dbRole = match (strtolower($role)) {
            'employer', 'recruiter' => 'Recruiter',
            'admin'                 => 'Admin',
            default                 => 'Candidate',
        };

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        // Check duplicate email
        $check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $check->execute(['email' => $email]);
        if ($check->fetchColumn() !== false) {
            return ['success' => false, 'message' => 'Email already registered'];
        }

        $userId = $this->generateUuidV4();
        $hash   = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $pdo->prepare(
            'INSERT INTO users (id, email, password, first_name, last_name, role, status)
             VALUES (:id, :email, :password, :first_name, :last_name, :role, :status)'
        )->execute([
            'id'         => $userId,
            'email'      => $email,
            'password'   => $hash,
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'role'       => $dbRole,
            'status'     => 'Active',
        ]);

        // Create candidate profile row if seeker
        if ($dbRole === 'Candidate') {
            $pdo->prepare(
                'INSERT INTO candidates (id, user_id, skills, experience_years, education_level, location, availability_status)
                 VALUES (:id, :user_id, :skills, 0, :edu, :loc, :avail)'
            )->execute([
                'id'      => $this->generateUuidV4(),
                'user_id' => $userId,
                'skills'  => '[]',
                'edu'     => 'Bachelor',
                'loc'     => '',
                'avail'   => 'Actively Looking',
            ]);
        }

        $name   = trim("$firstName $lastName");
        $uiRole = $this->mapDbRoleToUi($dbRole);
        $token  = $this->buildJwt($userId, $uiRole, $name, $email);

        return [
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'     => $userId,
                'name'   => $name,
                'email'  => $email,
                'role'   => $uiRole,
                'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // GET /auth/me  (requires auth middleware)
    // -------------------------------------------------------------------------
    public function me(Request $request): array
    {
        $userId = (string)($request->user('id') ?? '');
        if ($userId === '') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $stmt = $pdo->prepare(
            'SELECT u.id, u.email, u.first_name, u.last_name, u.role,
                    c.avatar_url
             FROM users u
             LEFT JOIN candidates c ON c.user_id = u.id
             WHERE u.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $userId]);
        $row = $stmt->fetch();

        if (!$row) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $name   = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
        $uiRole = $this->mapDbRoleToUi((string)($row['role'] ?? 'Candidate'));
        $avatar = ($row['avatar_url'] ?? '') ?: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';

        return [
            'success' => true,
            'user'    => [
                'id'     => (string)$row['id'],
                'name'   => $name,
                'email'  => (string)$row['email'],
                'role'   => $uiRole,
                'avatar' => $avatar,
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // POST /auth/logout
    // -------------------------------------------------------------------------
    public function logout(Request $request): array
    {
        // Stateless JWT — client just drops the token.
        // If using token table, delete it here.
        return ['success' => true, 'message' => 'Logged out'];
    }
}
