<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Modules\Messaging\Services\MessagingService;
use Throwable;

final class MessagingController
{
    private MessagingService $messagingService;

    public function __construct()
    {
        $this->messagingService = new MessagingService();
    }

    /**
     * Send a message
     * POST /api/messaging/send
     */
    public function sendMessage(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $data = $request->json();
            return $this->messagingService->sendMessage($userId, $data);
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get conversation messages
     * GET /api/messaging/conversations/{conversationId}/messages
     */
    public function getConversationMessages(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $conversationId = (string)($request->route('conversationId') ?? '');
            $limit = max(1, min(100, (int)($request->query('limit', 50))));
            $offset = max(0, (int)($request->query('offset', 0)));

            return $this->messagingService->getConversationMessages($userId, $conversationId, $limit, $offset);
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get user conversations
     * GET /api/messaging/conversations
     */
    public function getUserConversations(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $limit = max(1, min(100, (int)($request->query('limit', 20))));
            $offset = max(0, (int)($request->query('offset', 0)));

            return $this->messagingService->getUserConversations($userId, $limit, $offset);
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Mark message as read
     * PUT /api/messaging/messages/{messageId}/read
     */
    public function markMessageAsRead(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $messageId = (string)($request->route('messageId') ?? '');
            $this->messagingService->markMessageAsRead($messageId, $userId);

            return ['success' => true, 'message' => 'Message marked as read'];
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Delete message
     * DELETE /api/messaging/messages/{messageId}
     */
    public function deleteMessage(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $messageId = (string)($request->route('messageId') ?? '');
            return $this->messagingService->deleteMessage($messageId, $userId);
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Search messages
     * GET /api/messaging/conversations/{conversationId}/search
     */
    public function searchMessages(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $conversationId = (string)($request->route('conversationId') ?? '');
            $query = (string)($request->query('q', ''));

            if ($query === '') {
                return ['success' => false, 'message' => 'Search query is required'];
            }

            return $this->messagingService->searchMessages($userId, $conversationId, $query);
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Update typing status
     * POST /api/messaging/conversations/{conversationId}/typing
     */
    public function updateTypingStatus(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $conversationId = (string)($request->route('conversationId') ?? '');
            $data = $request->json();
            $isTyping = (bool)($data['is_typing'] ?? false);

            $this->messagingService->updateTypingStatus($conversationId, $userId, $isTyping);

            return ['success' => true, 'message' => 'Typing status updated'];
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get typing users
     * GET /api/messaging/conversations/{conversationId}/typing
     */
    public function getTypingUsers(Request $request): array
    {
        try {
            $conversationId = (string)($request->route('conversationId') ?? '');
            $typingUsers = $this->messagingService->getTypingUsers($conversationId);

            return ['success' => true, 'typing_users' => $typingUsers];
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Update online status
     * POST /api/messaging/online-status
     */
    public function updateOnlineStatus(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $data = $request->json();
            $isOnline = (bool)($data['is_online'] ?? true);

            $this->messagingService->updateOnlineStatus($userId, $isOnline);

            return ['success' => true, 'message' => 'Online status updated'];
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get user online status
     * GET /api/messaging/users/{userId}/online-status
     */
    public function getUserOnlineStatus(Request $request): array
    {
        try {
            $userId = (string)($request->route('userId') ?? '');
            $status = $this->messagingService->getUserOnlineStatus($userId);

            return ['success' => true, 'status' => $status];
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Block user
     * POST /api/messaging/block
     */
    public function blockUser(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $data = $request->json();
            $blockedId = $data['blocked_id'] ?? null;
            $reason = $data['reason'] ?? null;

            if (!$blockedId) {
                return ['success' => false, 'message' => 'Blocked user ID is required'];
            }

            return $this->messagingService->blockUser($userId, $blockedId, $reason);
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Unblock user
     * DELETE /api/messaging/block/{blockedId}
     */
    public function unblockUser(Request $request): array
    {
        try {
            $userId = (string)($request->user('id') ?? '');
            if ($userId === '') {
                return ['success' => false, 'message' => 'Unauthorized'];
            }

            $blockedId = (string)($request->route('blockedId') ?? '');
            return $this->messagingService->unblockUser($userId, $blockedId);
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}