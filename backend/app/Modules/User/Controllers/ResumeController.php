<?php

declare(strict_types=1);

namespace App\Modules\User\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Core\Database\Connection;
use PDO;
use Throwable;

final class ResumeController
{
    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * GET /api/user/resume
     * Get user resume data
     */
    public function getResume(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $pdo = Connection::getPdo();
            $stmt = $pdo->prepare('SELECT * FROM user_resume_data WHERE user_id = ?');
            $stmt->execute([$userId]);
            $resume = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$resume) {
                return Response::json([
                    'success' => true,
                    'data' => null
                ]);
            }

            // Decode JSON fields
            $resume['personal_info'] = json_decode($resume['personal_info'] ?? '{}', true);
            $resume['headers'] = json_decode($resume['headers'] ?? '{}', true);
            $resume['sections'] = json_decode($resume['sections'] ?? '[]', true);

            return Response::json([
                'success' => true,
                'data' => $resume
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/user/resume
     * Update user resume data
     */
    public function updateResume(Request $request): Response
    {
        $userId = $request->header('x-user-id');
        if (!$userId) {
            return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = $request->json();

        try {
            $pdo = Connection::getPdo();

            // Prepare JSON fields
            $personalInfo = json_encode($data['personal_info'] ?? []);
            $headers = json_encode($data['headers'] ?? []);
            $sections = json_encode($data['sections'] ?? []);

            // Check if resume exists
            $stmt = $pdo->prepare('SELECT id FROM user_resume_data WHERE user_id = ?');
            $stmt->execute([$userId]);
            $exists = $stmt->fetchColumn();

            if ($exists) {
                // Update existing
                $stmt = $pdo->prepare('
                    UPDATE user_resume_data 
                    SET theme = ?, include_avatar = ?, personal_info = ?, 
                        summary = ?, skills = ?, languages = ?, headers = ?, sections = ?
                    WHERE user_id = ?
                ');
                $stmt->execute([
                    $data['theme'] ?? 'executive',
                    $data['include_avatar'] ?? false,
                    $personalInfo,
                    $data['summary'] ?? null,
                    $data['skills'] ?? null,
                    $data['languages'] ?? null,
                    $headers,
                    $sections,
                    $userId
                ]);
            } else {
                // Insert new
                $id = $this->generateUuidV4();
                $stmt = $pdo->prepare('
                    INSERT INTO user_resume_data 
                    (id, user_id, theme, include_avatar, personal_info, summary, skills, languages, headers, sections)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ');
                $stmt->execute([
                    $id,
                    $userId,
                    $data['theme'] ?? 'executive',
                    $data['include_avatar'] ?? false,
                    $personalInfo,
                    $data['summary'] ?? null,
                    $data['skills'] ?? null,
                    $data['languages'] ?? null,
                    $headers,
                    $sections
                ]);
            }

            // Fetch updated resume
            $stmt = $pdo->prepare('SELECT * FROM user_resume_data WHERE user_id = ?');
            $stmt->execute([$userId]);
            $resume = $stmt->fetch(PDO::FETCH_ASSOC);

            // Decode JSON fields
            $resume['personal_info'] = json_decode($resume['personal_info'] ?? '{}', true);
            $resume['headers'] = json_decode($resume['headers'] ?? '{}', true);
            $resume['sections'] = json_decode($resume['sections'] ?? '[]', true);

            return Response::json([
                'success' => true,
                'message' => 'Resume updated successfully',
                'data' => $resume
            ]);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => 'Failed to update resume: ' . $e->getMessage()
            ], 500);
        }
    }
}
