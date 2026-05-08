<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Services;

use App\Core\Database\Connection;
use App\Modules\Messaging\Repositories\ConversationRepository;
use App\Modules\Messaging\Repositories\MessageRepository;
use App\Modules\Messaging\Repositories\AttachmentRepository;
use PDO;

final class MessagingService
{
    private PDO $pdo;
    private ConversationRepository $conversationRepo;
    private MessageRepository $messageRepo;
    private AttachmentRepository $attachmentRepo;

    public function __construct()
    {
        $this->pdo = Connection::getPdo();
        $this->conversationRepo = new ConversationRepository();
        $this->messageRepo = new MessageRepository();
        $this->attachmentRepo = new AttachmentRepository();
    }

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Send a message
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function sendMessage(string $userId, array $data): array
    {
        $recipientId = $data['recipient_id'] ?? null;
        $content = $data['content'] ?? null;
        $messageType = $data['message_type'] ?? 'text';

        if (!$recipientId) {
            throw new \Exception('Recipient ID is required');
        }

        if (!$content && $messageType === 'text') {
            throw new \Exception('Message content is required');
        }

        // Check if users are blocked
        if ($this->isUserBlocked($userId, $recipientId)) {
            throw new \Exception('You cannot message this user');
        }

        // Get or create conversation
        $conversation = $this->conversationRepo->getOrCreateConversation($userId, $recipientId);

        // Create message
        $message = $this->messageRepo->createMessage(
            $conversation->id,
            $userId,
            $content,
            $messageType
        );

        // Update conversation last message
        $this->conversationRepo->updateLastMessage($conversation->id, $message->id);

        // Create message status record
        $this->createMessageStatus($message->id, $recipientId, 'sent');

        // Create notification
        $this->createNotification(
            $recipientId,
            'message',
            $userId,
            $message->id,
            'New message',
            $content ?? 'Sent a file'
        );

        return [
            'success' => true,
            'message' => $message->toArray(),
            'conversation_id' => $conversation->id,
        ];
    }

    /**
     * Get conversation messages
     * @return array<string, mixed>
     */
    public function getConversationMessages(
        string $userId,
        string $conversationId,
        int $limit = 50,
        int $offset = 0
    ): array {
        // Verify user is participant
        if (!$this->conversationRepo->isUserParticipant($conversationId, $userId)) {
            throw new \Exception('Unauthorized access to conversation');
        }

        $messages = $this->messageRepo->getConversationMessages($conversationId, $limit, $offset);

        // Mark messages as read
        foreach ($messages as $message) {
            if ($message['sender_id'] !== $userId) {
                $this->markMessageAsRead($message['id'], $userId);
            }
        }

        return [
            'success' => true,
            'messages' => $messages,
            'total' => count($messages),
        ];
    }

    /**
     * Get user conversations
     * @return array<string, mixed>
     */
    public function getUserConversations(string $userId, int $limit = 20, int $offset = 0): array
    {
        $conversations = $this->conversationRepo->getUserConversations($userId, $limit, $offset);
        $totalUnread = $this->messageRepo->getTotalUnreadCount($userId);

        return [
            'success' => true,
            'conversations' => $conversations,
            'total_unread' => $totalUnread,
            'count' => count($conversations),
        ];
    }

    /**
     * Mark message as read
     */
    public function markMessageAsRead(string $messageId, string $userId): void
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO message_statuses (id, message_id, user_id, status)
            VALUES (?, ?, ?, "read")
            ON DUPLICATE KEY UPDATE status = "read", status_at = NOW()
        ');
        $stmt->execute([$this->generateUuidV4(), $messageId, $userId]);
    }

    /**
     * Mark message as delivered
     */
    public function markMessageAsDelivered(string $messageId, string $userId): void
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO message_statuses (id, message_id, user_id, status)
            VALUES (?, ?, ?, "delivered")
            ON DUPLICATE KEY UPDATE status = "delivered", status_at = NOW()
        ');
        $stmt->execute([$this->generateUuidV4(), $messageId, $userId]);
    }

    /**
     * Delete message
     */
    public function deleteMessage(string $messageId, string $userId): array
    {
        $message = $this->messageRepo->getMessageById($messageId);
        if (!$message) {
            throw new \Exception('Message not found');
        }

        if ($message->sender_id !== $userId) {
            throw new \Exception('Unauthorized to delete this message');
        }

        $this->messageRepo->deleteMessage($messageId);

        return [
            'success' => true,
            'message' => 'Message deleted successfully',
        ];
    }

    /**
     * Search messages
     * @return array<string, mixed>
     */
    public function searchMessages(
        string $userId,
        string $conversationId,
        string $query
    ): array {
        if (!$this->conversationRepo->isUserParticipant($conversationId, $userId)) {
            throw new \Exception('Unauthorized access to conversation');
        }

        $messages = $this->messageRepo->searchMessages($conversationId, $query);

        return [
            'success' => true,
            'messages' => $messages,
            'count' => count($messages),
        ];
    }

    /**
     * Update typing status
     */
    public function updateTypingStatus(string $conversationId, string $userId, bool $isTyping): void
    {
        if ($isTyping) {
            $stmt = $this->pdo->prepare('
                INSERT INTO typing_status (id, conversation_id, user_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE started_at = NOW()
            ');
            $stmt->execute([$this->generateUuidV4(), $conversationId, $userId]);
        } else {
            $stmt = $this->pdo->prepare('
                DELETE FROM typing_status WHERE conversation_id = ? AND user_id = ?
            ');
            $stmt->execute([$conversationId, $userId]);
        }
    }

    /**
     * Get typing users in conversation
     * @return array<int, array<string, mixed>>
     */
    public function getTypingUsers(string $conversationId): array
    {
        $stmt = $this->pdo->prepare('
            SELECT u.id, u.name, u.avatar
            FROM typing_status ts
            JOIN users u ON u.id = ts.user_id
            WHERE ts.conversation_id = ?
            AND ts.started_at > DATE_SUB(NOW(), INTERVAL 5 SECOND)
        ');
        $stmt->execute([$conversationId]);
        return $stmt->fetchAll();
    }

    /**
     * Update online status
     */
    public function updateOnlineStatus(string $userId, bool $isOnline): void
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO user_online_status (id, user_id, is_online, last_seen_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE is_online = ?, last_seen_at = NOW()
        ');
        $stmt->execute([$this->generateUuidV4(), $userId, $isOnline, $isOnline]);
    }

    /**
     * Get user online status
     */
    public function getUserOnlineStatus(string $userId): array
    {
        $stmt = $this->pdo->prepare('
            SELECT is_online, last_seen_at FROM user_online_status WHERE user_id = ?
        ');
        $stmt->execute([$userId]);
        $result = $stmt->fetch();

        return $result ?? ['is_online' => false, 'last_seen_at' => null];
    }

    /**
     * Block user
     */
    public function blockUser(string $blockerId, string $blockedId, ?string $reason = null): array
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO blocked_users (id, blocker_id, blocked_id, reason)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE reason = ?
        ');
        $stmt->execute([$this->generateUuidV4(), $blockerId, $blockedId, $reason, $reason]);

        return [
            'success' => true,
            'message' => 'User blocked successfully',
        ];
    }

    /**
     * Unblock user
     */
    public function unblockUser(string $blockerId, string $blockedId): array
    {
        $stmt = $this->pdo->prepare('
            DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?
        ');
        $stmt->execute([$blockerId, $blockedId]);

        return [
            'success' => true,
            'message' => 'User unblocked successfully',
        ];
    }

    /**
     * Check if user is blocked
     */
    private function isUserBlocked(string $userId, string $targetUserId): bool
    {
        $stmt = $this->pdo->prepare('
            SELECT 1 FROM blocked_users 
            WHERE (blocker_id = ? AND blocked_id = ?) 
            OR (blocker_id = ? AND blocked_id = ?)
        ');
        $stmt->execute([$userId, $targetUserId, $targetUserId, $userId]);
        return (bool) $stmt->fetch();
    }

    /**
     * Create message status record
     */
    private function createMessageStatus(string $messageId, string $userId, string $status): void
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO message_statuses (id, message_id, user_id, status)
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([$this->generateUuidV4(), $messageId, $userId, $status]);
    }

    /**
     * Create notification
     */
    private function createNotification(
        string $userId,
        string $type,
        ?string $relatedUserId = null,
        ?string $relatedMessageId = null,
        ?string $title = null,
        ?string $body = null
    ): void {
        $stmt = $this->pdo->prepare('
            INSERT INTO notifications (id, user_id, type, related_user_id, related_message_id, title, body)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $this->generateUuidV4(),
            $userId,
            $type,
            $relatedUserId,
            $relatedMessageId,
            $title,
            $body,
        ]);
    }
}
