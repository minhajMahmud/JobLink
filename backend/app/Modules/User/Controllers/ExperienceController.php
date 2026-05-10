<?php

declare(strict_types=1);

namespace App\Modules\User\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Core\Database\Connection;
use PDO;
use Throwable;

final class ExperienceController
{
    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * GET /api/user/experience
     * Get all experience entries for user
     */
    public function getExperience(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('
                SELECT * FROM user_experience 
                WHERE user_id = ? 
                ORDER BY is_current DESC, start_date DESC
            ');
            $stmt->execute([$userId]);
            $experience = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return Response::json([
                'success' => true,
                'data' => $experience
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/user/experience
     * Add new experience entry
     */
    public function addExperience(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = $request->json();

        // Validate required fields
        if (empty($data['title']) || empty($data['company']) || empty($data['start_date'])) {
            return Response::json([
                'success' => false,
                'message' => 'Title, company, and start date are required'
            ], 400);
        }

        try {
            $pdo = Connection::getPdo();
            $id = $this->generateUuidV4();

            $stmt = $pdo->prepare('
                INSERT INTO user_experience 
                (id, user_id, title, company, location, employment_type, start_date, end_date, is_current, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $id,
                $userId,
                $data['title'],
                $data['company'],
                $data['location'] ?? null,
                $data['employment_type'] ?? 'Full-time',
                $data['start_date'],
                $data['end_date'] ?? null,
                $data['is_current'] ?? false,
                $data['description'] ?? null
            ]);

            // Fetch the created entry
            $stmt = $pdo->prepare('SELECT * FROM user_experience WHERE id = ?');
            $stmt->execute([$id]);
            $experience = $stmt->fetch(PDO::FETCH_ASSOC);

            return Response::json([
                'success' => true,
                'message' => 'Experience added successfully',
                'data' => $experience
            ], 201);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to add experience: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/user/experience/{id}
     * Update experience entry
     */
    public function updateExperience(Request $request, string $id): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = $request->json();

        try {
            $pdo = Connection::getPdo();

            // Verify ownership
            $stmt = $pdo->prepare('SELECT user_id FROM user_experience WHERE id = ?');
            $stmt->execute([$id]);
            $ownerId = $stmt->fetchColumn();

            if (!$ownerId || $ownerId !== $userId) {
                return Response::json([
                    'success' => false,
                    'message' => 'Experience not found or unauthorized'
                ], 404);
            }

            // Build update query
            $fields = [];
            $values = [];

            $allowedFields = [
                'title', 'company', 'location', 'employment_type',
                'start_date', 'end_date', 'is_current', 'description'
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

            $values[] = $id;
            $sql = 'UPDATE user_experience SET ' . implode(', ', $fields) . ' WHERE id = ?';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            // Fetch updated entry
            $stmt = $pdo->prepare('SELECT * FROM user_experience WHERE id = ?');
            $stmt->execute([$id]);
            $experience = $stmt->fetch(PDO::FETCH_ASSOC);

            return Response::json([
                'success' => true,
                'message' => 'Experience updated successfully',
                'data' => $experience
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to update experience: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/user/experience/{id}
     * Delete experience entry
     */
    public function deleteExperience(Request $request, string $id): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $pdo = Connection::getPdo();

            // Verify ownership and delete
            $stmt = $pdo->prepare('DELETE FROM user_experience WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);

            if ($stmt->rowCount() === 0) {
                return Response::json([
                    'success' => false,
                    'message' => 'Experience not found or unauthorized'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'message' => 'Experience deleted successfully'
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to delete experience: ' . $e->getMessage()
            ], 500);
        }
    }
}
