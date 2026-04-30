<?php

declare(strict_types=1);

namespace App\Modules\Network\Controllers;

use App\Core\Database\Connection;
use App\Core\Http\Request;
use PDO;
use Throwable;

final class NetworkController
{
    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * GET /network/suggestions
     * Returns users the current user is NOT yet connected with.
     */
    public function getSuggestions(Request $request): array
    {
        $userId = (string)($request->user('id') ?? '');
        $limit  = min(50, max(1, (int)($request->query('limit', 20))));

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable', 'data' => []];
        }

        // Fetch users excluding self and already-connected
        $stmt = $pdo->prepare(
            'SELECT u.id, u.first_name, u.last_name, u.role,
                    c.avatar_url, c.bio, c.location,
                    u.connections_count
             FROM users u
             LEFT JOIN candidates c ON c.user_id = u.id
             WHERE u.id != :uid
               AND u.status = \'Active\'
               AND u.id NOT IN (
                   SELECT CASE WHEN requester_id = :uid2 THEN addressee_id ELSE requester_id END
                   FROM user_connections
                   WHERE (requester_id = :uid3 OR addressee_id = :uid4)
                     AND status IN (\'accepted\', \'pending\')
               )
             ORDER BY u.connections_count DESC
             LIMIT :lim'
        );
        $stmt->bindValue(':uid',  $userId);
        $stmt->bindValue(':uid2', $userId);
        $stmt->bindValue(':uid3', $userId);
        $stmt->bindValue(':uid4', $userId);
        $stmt->bindValue(':lim',  $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll() ?: [];

        $data = array_map(function (array $row): array {
            $name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            return [
                'id'          => (string)$row['id'],
                'name'        => $name !== '' ? $name : 'Unknown',
                'title'       => (string)($row['bio'] ?? ''),
                'avatar'      => (string)($row['avatar_url'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
                'company'     => '',
                'connections' => (int)($row['connections_count'] ?? 0),
                'role'        => strtolower((string)($row['role'] ?? 'seeker')),
                'location'    => (string)($row['location'] ?? ''),
            ];
        }, $rows);

        return ['success' => true, 'data' => $data];
    }

    /**
     * GET /network/connections
     * Returns accepted connections for the current user.
     */
    public function getConnections(Request $request): array
    {
        $userId = (string)($request->user('id') ?? '');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable', 'data' => []];
        }

        $stmt = $pdo->prepare(
            'SELECT uc.id AS connection_id, uc.status, uc.created_at,
                    u.id, u.first_name, u.last_name, u.role,
                    c.avatar_url, c.bio, u.connections_count
             FROM user_connections uc
             JOIN users u ON u.id = CASE WHEN uc.requester_id = :uid THEN uc.addressee_id ELSE uc.requester_id END
             LEFT JOIN candidates c ON c.user_id = u.id
             WHERE (uc.requester_id = :uid2 OR uc.addressee_id = :uid3)
               AND uc.status = \'accepted\'
             ORDER BY uc.updated_at DESC'
        );
        $stmt->execute(['uid' => $userId, 'uid2' => $userId, 'uid3' => $userId]);
        $rows = $stmt->fetchAll() ?: [];

        $data = array_map(function (array $row): array {
            $name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            return [
                'connectionId' => (string)$row['connection_id'],
                'id'           => (string)$row['id'],
                'name'         => $name !== '' ? $name : 'Unknown',
                'title'        => (string)($row['bio'] ?? ''),
                'avatar'       => (string)($row['avatar_url'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
                'connections'  => (int)($row['connections_count'] ?? 0),
                'role'         => strtolower((string)($row['role'] ?? 'seeker')),
                'connectedAt'  => (string)($row['created_at'] ?? ''),
            ];
        }, $rows);

        return ['success' => true, 'data' => $data];
    }

    /**
     * POST /network/connect/{userId}
     * Send a connection request.
     */
    public function sendRequest(Request $request, string $targetUserId): array
    {
        $userId = (string)($request->user('id') ?? '');
        if ($userId === '' || $userId === $targetUserId) {
            return ['success' => false, 'message' => 'Invalid request'];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        // Check if connection already exists
        $existing = $pdo->prepare(
            'SELECT id, status FROM user_connections
             WHERE (requester_id = :r AND addressee_id = :a)
                OR (requester_id = :a2 AND addressee_id = :r2)
             LIMIT 1'
        );
        $existing->execute(['r' => $userId, 'a' => $targetUserId, 'a2' => $targetUserId, 'r2' => $userId]);
        $row = $existing->fetch();

        if ($row) {
            if ((string)$row['status'] === 'accepted') {
                return ['success' => true, 'message' => 'Already connected', 'status' => 'accepted'];
            }
            if ((string)$row['status'] === 'pending') {
                return ['success' => true, 'message' => 'Request already sent', 'status' => 'pending'];
            }
            // Re-activate declined/blocked
            $pdo->prepare('UPDATE user_connections SET status = \'pending\', updated_at = NOW() WHERE id = :id')
                ->execute(['id' => $row['id']]);
            return ['success' => true, 'status' => 'pending'];
        }

        $pdo->prepare(
            'INSERT INTO user_connections (id, requester_id, addressee_id, status)
             VALUES (:id, :requester, :addressee, \'pending\')'
        )->execute([
            'id'        => $this->generateUuidV4(),
            'requester' => $userId,
            'addressee' => $targetUserId,
        ]);

        return ['success' => true, 'status' => 'pending'];
    }

    /**
     * DELETE /network/connect/{userId}
     * Remove / withdraw a connection or request.
     */
    public function removeConnection(Request $request, string $targetUserId): array
    {
        $userId = (string)($request->user('id') ?? '');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $pdo->prepare(
            'DELETE FROM user_connections
             WHERE (requester_id = :r AND addressee_id = :a)
                OR (requester_id = :a2 AND addressee_id = :r2)'
        )->execute(['r' => $userId, 'a' => $targetUserId, 'a2' => $targetUserId, 'r2' => $userId]);

        // Decrement counts
        $pdo->prepare('UPDATE users SET connections_count = GREATEST(0, connections_count - 1) WHERE id IN (:u1, :u2)')
            ->execute(['u1' => $userId, 'u2' => $targetUserId]);

        return ['success' => true, 'message' => 'Connection removed'];
    }

    /**
     * PATCH /network/connect/{userId}/accept
     * Accept a pending connection request.
     */
    public function acceptRequest(Request $request, string $requesterId): array
    {
        $userId = (string)($request->user('id') ?? '');

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $stmt = $pdo->prepare(
            'UPDATE user_connections SET status = \'accepted\', updated_at = NOW()
             WHERE requester_id = :requester AND addressee_id = :addressee AND status = \'pending\''
        );
        $stmt->execute(['requester' => $requesterId, 'addressee' => $userId]);

        if ($stmt->rowCount() > 0) {
            // Increment connection counts for both users
            $pdo->prepare('UPDATE users SET connections_count = connections_count + 1 WHERE id = :id')
                ->execute(['id' => $userId]);
            $pdo->prepare('UPDATE users SET connections_count = connections_count + 1 WHERE id = :id')
                ->execute(['id' => $requesterId]);
        }

        return ['success' => true, 'status' => 'accepted'];
    }
}
