<?php

declare(strict_types=1);

namespace App\Modules\User\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Core\Database\Connection;
use PDO;
use Throwable;

final class EducationController
{
    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * GET /api/user/education
     * Get all education entries for user
     */
    public function getEducation(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('
                SELECT * FROM user_education 
                WHERE user_id = ? 
                ORDER BY is_current DESC, start_date DESC
            ');
            $stmt->execute([$userId]);
            $education = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return Response::json([
                'success' => true,
                'data' => $education
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/user/education
     * Add new education entry
     */
    public function addEducation(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = $request->json();

        // Validate required fields
        if (empty($data['school']) || empty($data['degree']) || empty($data['start_date'])) {
            return Response::json([
                'success' => false,
                'message' => 'School, degree, and start date are required'
            ], 400);
        }

        try {
            $pdo = Connection::getPdo();
            $id = $this->generateUuidV4();

            $stmt = $pdo->prepare('
                INSERT INTO user_education 
                (id, user_id, school, degree, field_of_study, start_date, end_date, is_current, grade, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $id,
                $userId,
                $data['school'],
                $data['degree'],
                $data['field_of_study'] ?? null,
                $data['start_date'],
                $data['end_date'] ?? null,
                $data['is_current'] ?? false,
                $data['grade'] ?? null,
                $data['description'] ?? null
            ]);

            // Fetch the created entry
            $stmt = $pdo->prepare('SELECT * FROM user_education WHERE id = ?');
            $stmt->execute([$id]);
            $education = $stmt->fetch(PDO::FETCH_ASSOC);

            return Response::json([
                'success' => true,
                'message' => 'Education added successfully',
                'data' => $education
            ], 201);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to add education: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/user/education/{id}
     * Update education entry
     */
    public function updateEducation(Request $request, string $id): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = $request->json();

        try {
            $pdo = Connection::getPdo();

            // Verify ownership
            $stmt = $pdo->prepare('SELECT user_id FROM user_education WHERE id = ?');
            $stmt->execute([$id]);
            $ownerId = $stmt->fetchColumn();

            if (!$ownerId || $ownerId !== $userId) {
                return Response::json([
                    'success' => false,
                    'message' => 'Education not found or unauthorized'
                ], 404);
            }

            // Build update query
            $fields = [];
            $values = [];

            $allowedFields = [
                'school', 'degree', 'field_of_study', 'start_date',
                'end_date', 'is_current', 'grade', 'description'
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
            $sql = 'UPDATE user_education SET ' . implode(', ', $fields) . ' WHERE id = ?';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            // Fetch updated entry
            $stmt = $pdo->prepare('SELECT * FROM user_education WHERE id = ?');
            $stmt->execute([$id]);
            $education = $stmt->fetch(PDO::FETCH_ASSOC);

            return Response::json([
                'success' => true,
                'message' => 'Education updated successfully',
                'data' => $education
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to update education: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/user/education/{id}
     * Delete education entry
     */
    public function deleteEducation(Request $request, string $id): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $pdo = Connection::getPdo();

            // Verify ownership and delete
            $stmt = $pdo->prepare('DELETE FROM user_education WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);

            if ($stmt->rowCount() === 0) {
                return Response::json([
                    'success' => false,
                    'message' => 'Education not found or unauthorized'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'message' => 'Education deleted successfully'
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to delete education: ' . $e->getMessage()
            ], 500);
        }
    }
}
