<?php

declare(strict_types=1);

namespace App\Modules\User\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Core\Database\Connection;
use PDO;
use Throwable;

final class ProfileController
{
    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * GET /api/user/profile
     * Get user profile with all related data
     */
    public function getProfile(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $pdo = Connection::getPdo();
            
            // Get user basic info
            $stmt = $pdo->prepare('
                SELECT id, first_name, last_name, email, bio, headline, 
                       location, website, phone, avatar_url, role, created_at
                FROM users 
                WHERE id = ?
            ');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return Response::json(['success' => false, 'message' => 'User not found'], 404);
            }

            // Get experience
            $stmt = $pdo->prepare('
                SELECT * FROM user_experience 
                WHERE user_id = ? 
                ORDER BY is_current DESC, start_date DESC
            ');
            $stmt->execute([$userId]);
            $user['experience'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get education
            $stmt = $pdo->prepare('
                SELECT * FROM user_education 
                WHERE user_id = ? 
                ORDER BY is_current DESC, start_date DESC
            ');
            $stmt->execute([$userId]);
            $user['education'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get projects
            $stmt = $pdo->prepare('
                SELECT * FROM user_projects 
                WHERE user_id = ? 
                ORDER BY is_current DESC, start_date DESC
            ');
            $stmt->execute([$userId]);
            $user['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get publications
            $stmt = $pdo->prepare('
                SELECT * FROM user_publications 
                WHERE user_id = ? 
                ORDER BY publication_date DESC
            ');
            $stmt->execute([$userId]);
            $user['publications'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get certifications
            $stmt = $pdo->prepare('
                SELECT * FROM user_certifications 
                WHERE user_id = ? 
                ORDER BY issue_date DESC
            ');
            $stmt->execute([$userId]);
            $user['certifications'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get skills
            $stmt = $pdo->prepare('
                SELECT * FROM user_skills 
                WHERE user_id = ? 
                ORDER BY endorsement_count DESC
            ');
            $stmt->execute([$userId]);
            $user['skills'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get custom URL
            $stmt = $pdo->prepare('SELECT custom_url FROM user_custom_urls WHERE user_id = ?');
            $stmt->execute([$userId]);
            $customUrl = $stmt->fetchColumn();
            $user['custom_url'] = $customUrl ?: null;

            return Response::json([
                'success' => true,
                'status' => true,
                'data' => $user
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to load profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/user/profile
     * Update user basic profile info
     */
    public function updateProfile(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = $request->json();

        try {
            $pdo = Connection::getPdo();
            
            $fields = [];
            $values = [];
            
            $allowedFields = [
                'first_name', 'last_name', 'bio', 'headline', 
                'location', 'website', 'phone'
            ];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($fields)) {
                return Response::json(['success' => false, 'message' => 'No fields to update'], 400);
            }

            $values[] = $userId;
            $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            // Fetch updated profile
            $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            return Response::json([
                'success' => true,
                'status' => true,
                'message' => 'Profile updated successfully',
                'data' => $user
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/user/custom-url
     */
    public function getCustomUrl(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('SELECT custom_url FROM user_custom_urls WHERE user_id = ?');
            $stmt->execute([$userId]);
            $customUrl = $stmt->fetchColumn();

            return Response::json([
                'success' => true,
                'data' => ['custom_url' => $customUrl ?: null]
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/user/custom-url
     */
    public function updateCustomUrl(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = $request->json();
        $customUrl = $data['custom_url'] ?? '';

        if (empty($customUrl)) {
            return Response::json(['success' => false, 'message' => 'Custom URL is required'], 400);
        }

        // Validate custom URL format
        if (!preg_match('/^[a-z0-9-]+$/', $customUrl)) {
            return Response::json([
                'success' => false,
                'message' => 'Custom URL can only contain lowercase letters, numbers, and hyphens'
            ], 400);
        }

        try {
            $pdo = Connection::getPdo();
            
            // Check if URL is already taken
            $stmt = $pdo->prepare('SELECT user_id FROM user_custom_urls WHERE custom_url = ? AND user_id != ?');
            $stmt->execute([$customUrl, $userId]);
            if ($stmt->fetch()) {
                return Response::json([
                    'success' => false,
                    'message' => 'This custom URL is already taken'
                ], 400);
            }

            // Insert or update
            $stmt = $pdo->prepare('
                INSERT INTO user_custom_urls (id, user_id, custom_url)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE custom_url = ?
            ');
            $stmt->execute([$this->generateUuidV4(), $userId, $customUrl, $customUrl]);

            return Response::json([
                'success' => true,
                'message' => 'Custom URL updated successfully',
                'data' => ['custom_url' => $customUrl]
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to update custom URL: ' . $e->getMessage()
            ], 500);
        }
    }
}
