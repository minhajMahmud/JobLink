<?php

declare(strict_types=1);

namespace App\Modules\Notifications\Controllers;

use App\Core\Database\Connection;
use App\Core\Http\Request;
use PDO;
use Throwable;

final class NotificationsController
{
    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    private function humanTime(string $ts): string
    {
        $diff = time() - strtotime($ts);
        if ($diff < 60)     return 'Just now';
        if ($diff < 3600)   return floor($diff / 60) . ' minutes ago';
        if ($diff < 86400)  return floor($diff / 3600) . ' hours ago';
        if ($diff < 604800) return floor($diff / 86400) . ' days ago';
        return date('M j, Y', strtotime($ts));
    }

    /**
     * GET /notifications
     * Returns all notifications for the authenticated user.
     */
    public function index(Request $request): array
    {
        $userId = (string)($request->user('id') ?? '');
        if ($userId === '') {
            return ['success' => false, 'message' => 'Unauthorized', 'data' => []];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable', 'data' => []];
        }

        $stmt = $pdo->prepare(
            'SELECT id, category, title, description, href, priority, is_read, created_at
             FROM notifications
             WHERE user_id = :uid
             ORDER BY created_at DESC
             LIMIT 100'
        );
        $stmt->execute(['uid' => $userId]);
        $rows = $stmt->fetchAll() ?: [];

        $data = array_map(function (array $row): array {
            return [
                'id'          => (string)$row['id'],
                'category'    => (string)$row['category'],
                'title'       => (string)$row['title'],
                'description' => (string)($row['description'] ?? ''),
                'href'        => ($row['href'] ?? '') ?: null,
                'priority'    => (string)($row['priority'] ?? 'low'),
                'read'        => (bool)$row['is_read'],
                'time'        => $this->humanTime((string)$row['created_at']),
            ];
        }, $rows);

        $unread = count(array_filter($data, fn ($n) => !$n['read']));

        return [
            'success'     => true,
            'data'        => $data,
            'unreadCount' => $unread,
        ];
    }

    /**
     * PATCH /notifications/{id}/read
     * Mark a single notification as read.
     */
    public function markRead(Request $request, string $id): array
    {
        $userId = (string)($request->user('id') ?? '');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :uid')
            ->execute(['id' => $id, 'uid' => $userId]);

        return ['success' => true];
    }

    /**
     * PATCH /notifications/read-all
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): array
    {
        $userId = (string)($request->user('id') ?? '');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = :uid')
            ->execute(['uid' => $userId]);

        return ['success' => true];
    }

    /**
     * DELETE /notifications
     * Clear all notifications for the user.
     */
    public function clearAll(Request $request): array
    {
        $userId = (string)($request->user('id') ?? '');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $pdo->prepare('DELETE FROM notifications WHERE user_id = :uid')
            ->execute(['uid' => $userId]);

        return ['success' => true];
    }

    /**
     * POST /notifications  (internal / admin use)
     * Create a notification for a user.
     */
    public function create(Request $request): array
    {
        $data   = $request->json();
        $userId = (string)($data['user_id'] ?? '');

        if ($userId === '') {
            return ['success' => false, 'message' => 'user_id is required'];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $id = $this->generateUuidV4();
        $pdo->prepare(
            'INSERT INTO notifications (id, user_id, category, title, description, href, priority)
             VALUES (:id, :uid, :cat, :title, :desc, :href, :priority)'
        )->execute([
            'id'       => $id,
            'uid'      => $userId,
            'cat'      => $data['category'] ?? 'system',
            'title'    => (string)($data['title'] ?? ''),
            'desc'     => (string)($data['description'] ?? ''),
            'href'     => ($data['href'] ?? '') ?: null,
            'priority' => $data['priority'] ?? 'low',
        ]);

        return ['success' => true, 'data' => ['id' => $id]];
    }
}
