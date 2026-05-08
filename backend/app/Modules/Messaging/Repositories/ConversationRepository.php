<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Repositories;

use App\Core\Database\Connection;
use App\Modules\Messaging\Models\Conversation;
use PDO;

final class ConversationRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Connection::getPdo();
    }

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Get or create a conversation between two users
     */
    public function getOrCreateConversation(string $userId1, string $userId2): Conversation
    {
        // Ensure consistent ordering
        if ($userId1 > $userId2) {
            [$userId1, $userId2] = [$userId2, $userId1];
        }

        // Try to find existing conversation
        $stmt = $this->pdo->prepare(
            "SELECT * FROM conversations WHERE participant_1_id = ? AND participant_2_id = ?"
        );
        $stmt->execute([$userId1, $userId2]);
        $result = $stmt->fetch();

        if ($result) {
            return Conversation::fromArray($result);
        }

        // Create new conversation
        $id = $this->generateUuidV4();
        $stmt = $this->pdo->prepare(
            "INSERT INTO conversations (id, participant_1_id, participant_2_id) VALUES (?, ?, ?)"
        );
        $stmt->execute([$id, $userId1, $userId2]);

        return new Conversation(
            id: $id,
            participant_1_id: $userId1,
            participant_2_id: $userId2,
        );
    }

    /**
     * Get conversation by ID
     */
    public function getConversationById(string $conversationId): ?Conversation
    {
        $stmt = $this->pdo->prepare("SELECT * FROM conversations WHERE id = ?");
        $stmt->execute([$conversationId]);
        $result = $stmt->fetch();

        return $result ? Conversation::fromArray($result) : null;
    }

    /**
     * Get all conversations for a user with pagination
     * @return array<int, array<string, mixed>>
     */
    public function getUserConversations(string $userId, int $limit = 20, int $offset = 0): array
    {
        $sql = "
            SELECT c.*,
                   m.content as last_message_content,
                   m.message_type,
                   CONCAT(u.first_name, ' ', u.last_name) as other_user_name,
                   u.avatar_url as other_user_avatar,
                   u.id as other_user_id,
                   (SELECT COUNT(*) FROM messages m2
                    WHERE m2.conversation_id = c.id
                    AND m2.sender_id != ?
                    AND NOT EXISTS (
                        SELECT 1 FROM message_statuses ms
                        WHERE ms.message_id = m2.id
                        AND ms.user_id = ?
                        AND ms.status = 'read'
                    )) as unread_count
            FROM conversations c
            LEFT JOIN messages m ON m.id = c.last_message_id
            LEFT JOIN users u ON (u.id = c.participant_1_id AND c.participant_2_id = ?)
                              OR (u.id = c.participant_2_id AND c.participant_1_id = ?)
            WHERE c.participant_1_id = ? OR c.participant_2_id = ?
            ORDER BY c.last_message_at DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $userId, $userId, $userId, $userId, $userId, $limit, $offset]);
        return $stmt->fetchAll();
    }

    /**
     * Update last message in conversation
     */
    public function updateLastMessage(string $conversationId, string $messageId): void
    {
        $stmt = $this->pdo->prepare(
            "UPDATE conversations SET last_message_id = ?, last_message_at = NOW() WHERE id = ?"
        );
        $stmt->execute([$messageId, $conversationId]);
    }

    /**
     * Check if user is participant in conversation
     */
    public function isUserParticipant(string $conversationId, string $userId): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT 1 FROM conversations WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)"
        );
        $stmt->execute([$conversationId, $userId, $userId]);
        return (bool) $stmt->fetch();
    }
}