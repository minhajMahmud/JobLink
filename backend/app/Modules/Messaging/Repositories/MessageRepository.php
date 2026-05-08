<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Repositories;

use App\Core\Database\Connection;
use App\Modules\Messaging\Models\Message;
use PDO;

final class MessageRepository
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
     * Create a new message
     */
    public function createMessage(
        string $conversationId,
        string $senderId,
        ?string $content = null,
        string $messageType = 'text'
    ): Message {
        $id = $this->generateUuidV4();
        $stmt = $this->pdo->prepare('
            INSERT INTO messages (id, conversation_id, sender_id, content, message_type)
            VALUES (?, ?, ?, ?, ?)
        ');
        $stmt->execute([$id, $conversationId, $senderId, $content, $messageType]);

        return new Message(
            id: $id,
            conversation_id: $conversationId,
            sender_id: $senderId,
            content: $content,
            message_type: $messageType,
        );
    }

    /**
     * Get message by ID
     */
    public function getMessageById(string $messageId): ?Message
    {
        $stmt = $this->pdo->prepare('SELECT * FROM messages WHERE id = ?');
        $stmt->execute([$messageId]);
        $result = $stmt->fetch();

        return $result ? Message::fromArray($result) : null;
    }

    /**
     * Get conversation messages with pagination
     * @return array<int, array<string, mixed>>
     */
    public function getConversationMessages(
        string $conversationId,
        int $limit = 50,
        int $offset = 0
    ): array {
        $stmt = $this->pdo->prepare('
            SELECT m.*,
                   u.name as sender_name,
                   u.avatar as sender_avatar,
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                           "id", a.id,
                           "file_name", a.file_name,
                           "file_path", a.file_path,
                           "file_type", a.file_type,
                           "file_size", a.file_size,
                           "mime_type", a.mime_type
                       )
                   ) FROM attachments a WHERE a.message_id = m.id) as attachments,
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                           "user_id", ms.user_id,
                           "status", ms.status,
                           "status_at", ms.status_at
                       )
                   ) FROM message_statuses ms WHERE ms.message_id = m.id) as statuses
            FROM messages m
            LEFT JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = ? AND m.is_deleted = FALSE
            ORDER BY m.created_at DESC
            LIMIT ? OFFSET ?
        ');
        $stmt->execute([$conversationId, $limit, $offset]);
        return $stmt->fetchAll();
    }

    /**
     * Search messages in a conversation
     * @return array<int, array<string, mixed>>
     */
    public function searchMessages(string $conversationId, string $query, int $limit = 20): array
    {
        $searchQuery = '%' . $query . '%';
        $stmt = $this->pdo->prepare('
            SELECT m.*,
                   u.name as sender_name,
                   u.avatar as sender_avatar
            FROM messages m
            LEFT JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = ? 
            AND m.is_deleted = FALSE
            AND m.content LIKE ?
            ORDER BY m.created_at DESC
            LIMIT ?
        ');
        $stmt->execute([$conversationId, $searchQuery, $limit]);
        return $stmt->fetchAll();
    }

    /**
     * Delete a message (soft delete)
     */
    public function deleteMessage(string $messageId): void
    {
        $stmt = $this->pdo->prepare('
            UPDATE messages SET is_deleted = TRUE WHERE id = ?
        ');
        $stmt->execute([$messageId]);
    }

    /**
     * Get unread message count for user in conversation
     */
    public function getUnreadCount(string $conversationId, string $userId): int
    {
        $stmt = $this->pdo->prepare('
            SELECT COUNT(*) as count FROM messages m
            WHERE m.conversation_id = ? 
            AND m.sender_id != ?
            AND m.is_deleted = FALSE
            AND NOT EXISTS (
                SELECT 1 FROM message_statuses ms 
                WHERE ms.message_id = m.id 
                AND ms.user_id = ? 
                AND ms.status = "read"
            )
        ');
        $stmt->execute([$conversationId, $userId, $userId]);
        $result = $stmt->fetch();
        return (int) ($result['count'] ?? 0);
    }

    /**
     * Get total unread count for user across all conversations
     */
    public function getTotalUnreadCount(string $userId): int
    {
        $stmt = $this->pdo->prepare('
            SELECT COUNT(*) as count FROM messages m
            WHERE m.sender_id != ?
            AND m.is_deleted = FALSE
            AND NOT EXISTS (
                SELECT 1 FROM message_statuses ms 
                WHERE ms.message_id = m.id 
                AND ms.user_id = ? 
                AND ms.status = "read"
            )
            AND EXISTS (
                SELECT 1 FROM conversations c
                WHERE c.id = m.conversation_id
                AND (c.participant_1_id = ? OR c.participant_2_id = ?)
            )
        ');
        $stmt->execute([$userId, $userId, $userId, $userId]);
        $result = $stmt->fetch();
        return (int) ($result['count'] ?? 0);
    }
}
