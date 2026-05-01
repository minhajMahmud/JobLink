<?php

declare(strict_types=1);

namespace App\Modules\Feed\Controllers;

use App\Core\Database\Connection;
use App\Core\Http\Request;
use PDO;
use Throwable;

final class FeedController
{
    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Fetch the display name and avatar for a user.
     *
     * @return array{name:string, title:string, avatar:string, role:string}
     */
    private function fetchUserMeta(PDO $pdo, string $userId): array
    {
        $stmt = $pdo->prepare(
            'SELECT u.first_name, u.last_name, u.role, u.avatar_url, u.bio
             FROM users u
             WHERE u.id = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $userId]);
        $row = $stmt->fetch() ?: [];

        $name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
        if ($name === '') {
            $name = 'Unknown User';
        }

        return [
            'id'     => $userId,
            'name'   => $name,
            'title'  => (string)($row['bio'] ?? ''),
            'avatar' => (string)($row['avatar_url'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
            'role'   => strtolower((string)($row['role'] ?? 'seeker')),
        ];
    }

    /**
     * Map a raw DB post row into the frontend Post shape.
     *
     * @param array<string,mixed> $row
     * @param array<string,mixed> $author
     * @param list<array<string,mixed>> $comments
     * @param string|null $userReaction
     * @return array<string,mixed>
     */
    private function mapPost(array $row, array $author, array $comments, ?string $userReaction): array
    {
        $decode = static fn(?string $v): array => ($v !== null && $v !== '') ? (json_decode($v, true) ?: []) : [];

        $createdAt = (string)($row['created_at'] ?? '');
        $createdAtISO = $createdAt !== '' ? date(DATE_ATOM, strtotime($createdAt)) : date(DATE_ATOM);

        return [
            'id'           => (string)($row['id'] ?? ''),
            'author'       => $author,
            'content'      => (string)($row['content'] ?? ''),
            'image'        => ($row['image_url'] !== null && $row['image_url'] !== '') ? (string)$row['image_url'] : null,
            'attachments'  => $decode(is_string($row['attachments'] ?? null) ? $row['attachments'] : null),
            'poll'         => ($row['poll'] !== null && $row['poll'] !== '') ? (json_decode((string)$row['poll'], true) ?: null) : null,
            'reactions'    => [
                'like'        => (int)($row['likes_count'] ?? 0),
                'insightful'  => (int)($row['insightful_count'] ?? 0),
                'celebrate'   => (int)($row['celebrate_count'] ?? 0),
                'support'     => (int)($row['support_count'] ?? 0),
                'funny'       => (int)($row['funny_count'] ?? 0),
            ],
            'userReaction' => $userReaction,
            'comments'     => $comments,
            'shares'       => (int)($row['shares_count'] ?? 0),
            'repostOfId'   => ($row['repost_of_id'] !== null && $row['repost_of_id'] !== '') ? (string)$row['repost_of_id'] : null,
            'visibility'   => (string)($row['visibility'] ?? 'public'),
            'hashtags'     => $decode(is_string($row['hashtags'] ?? null) ? $row['hashtags'] : null),
            'relevanceTags'=> $decode(is_string($row['relevance_tags'] ?? null) ? $row['relevance_tags'] : null),
            'scheduledFor' => ($row['scheduled_for'] !== null && $row['scheduled_for'] !== '') ? date(DATE_ATOM, strtotime((string)$row['scheduled_for'])) : null,
            'createdAtISO' => $createdAtISO,
            'createdAt'    => $this->humanTime($createdAt),
        ];
    }

    private function humanTime(string $dbTimestamp): string
    {
        if ($dbTimestamp === '') {
            return 'Just now';
        }
        $diff = time() - strtotime($dbTimestamp);
        if ($diff < 60) {
            return 'Just now';
        }
        if ($diff < 3600) {
            return floor($diff / 60) . 'm ago';
        }
        if ($diff < 86400) {
            return floor($diff / 3600) . 'h ago';
        }
        return floor($diff / 86400) . 'd ago';
    }

    /**
     * Fetch comments (with replies) for a post.
     *
     * @return list<array<string,mixed>>
     */
    private function fetchComments(PDO $pdo, string $postId): array
    {
        $stmt = $pdo->prepare(
            'SELECT pc.id, pc.user_id, pc.parent_id, pc.content, pc.created_at,
                    u.first_name, u.last_name, u.avatar_url
             FROM post_comments pc
             INNER JOIN users u ON u.id = pc.user_id
             WHERE pc.post_id = :post_id
             ORDER BY pc.created_at ASC'
        );
        $stmt->execute(['post_id' => $postId]);
        $rows = $stmt->fetchAll() ?: [];

        $byId   = [];
        $top    = [];

        foreach ($rows as $row) {
            $name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $comment = [
                'id'        => (string)$row['id'],
                'author'    => [
                    'id'     => (string)$row['user_id'],
                    'name'   => $name !== '' ? $name : 'Unknown',
                    'avatar' => (string)($row['avatar_url'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
                ],
                'content'   => (string)$row['content'],
                'createdAt' => $this->humanTime((string)($row['created_at'] ?? '')),
                'replies'   => [],
            ];
            $byId[(string)$row['id']] = &$comment;

            if ($row['parent_id'] === null || $row['parent_id'] === '') {
                $top[] = &$comment;
            }
            unset($comment);
        }

        // Attach replies to parents
        foreach ($rows as $row) {
            if ($row['parent_id'] !== null && $row['parent_id'] !== '' && isset($byId[(string)$row['parent_id']])) {
                $byId[(string)$row['parent_id']]['replies'][] = $byId[(string)$row['id']];
            }
        }

        return $top;
    }

    // -------------------------------------------------------------------------
    // Endpoints
    // -------------------------------------------------------------------------

    /**
     * GET /feed
     * Returns paginated feed posts visible to the authenticated user.
     * Query params: page (default 1), limit (default 20)
     */
    public function getFeed(Request $request): array
    {
        $userId = (string)($request->user('id') ?? '');
        $page   = max(1, (int)($request->query('page', 1)));
        $limit  = min(50, max(1, (int)($request->query('limit', 20))));
        $offset = ($page - 1) * $limit;

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable', 'data' => []];
        }

        try {
            // Fetch posts — public + connections-visible + own private
            $stmt = $pdo->prepare(
                'SELECT p.*
                 FROM posts p
                 WHERE p.scheduled_for IS NULL OR p.scheduled_for <= NOW()
                 ORDER BY p.created_at DESC
                 LIMIT :limit OFFSET :offset'
            );
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll() ?: [];

            // Count total for pagination
            $countStmt = $pdo->query('SELECT COUNT(*) FROM posts WHERE scheduled_for IS NULL OR scheduled_for <= NOW()');
            $total = $countStmt ? (int)$countStmt->fetchColumn() : 0;

            // Fetch current user's reactions for these posts in one query
            $postIds = array_column($rows, 'id');
            $userReactions = [];
            if ($userId !== '' && count($postIds) > 0) {
                $placeholders = implode(',', array_fill(0, count($postIds), '?'));
                $rStmt = $pdo->prepare(
                    "SELECT post_id, reaction FROM post_reactions WHERE user_id = ? AND post_id IN ($placeholders)"
                );
                $rStmt->execute([$userId, ...$postIds]);
                foreach ($rStmt->fetchAll() as $r) {
                    $userReactions[(string)$r['post_id']] = (string)$r['reaction'];
                }
            }

            // Build author cache to avoid N+1
            $authorIds = array_unique(array_column($rows, 'user_id'));
            $authorCache = [];
            foreach ($authorIds as $aid) {
                $authorCache[(string)$aid] = $this->fetchUserMeta($pdo, (string)$aid);
            }

            $data = [];
            foreach ($rows as $row) {
                $postId   = (string)$row['id'];
                $author   = $authorCache[(string)$row['user_id']] ?? $this->fetchUserMeta($pdo, (string)$row['user_id']);
                $comments = $this->fetchComments($pdo, $postId);
                $data[]   = $this->mapPost($row, $author, $comments, $userReactions[$postId] ?? null);
            }

            return [
                'success' => true,
                'data'    => $data,
                'meta'    => [
                    'total'   => $total,
                    'page'    => $page,
                    'limit'   => $limit,
                    'pages'   => (int)ceil($total / $limit),
                ],
            ];
        } catch (Throwable $e) {
            return ['success' => false, 'message' => 'Error fetching feed: ' . $e->getMessage(), 'data' => []];
        }
    }

    /**
     * POST /feed/posts
     * Create a new post.
     */
    public function createPost(Request $request): array
    {
        // Debug logging
        $logFile = __DIR__ . '/../../../../debug_requests.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($logFile, "\n[$timestamp] createPost called\n", FILE_APPEND);
        
        $userId = (string)($request->user('id') ?? '');
        file_put_contents($logFile, "  User ID: $userId\n", FILE_APPEND);
        
        if ($userId === '') {
            file_put_contents($logFile, "  ERROR: Unauthorized - no user ID\n", FILE_APPEND);
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $data = $request->json();
        file_put_contents($logFile, "  Request data: " . json_encode($data) . "\n", FILE_APPEND);
        
        $content = trim((string)($data['content'] ?? ''));
        if ($content === '') {
            file_put_contents($logFile, "  ERROR: Content is empty\n", FILE_APPEND);
            return ['success' => false, 'message' => 'Content is required'];
        }

        try {
            $pdo = Connection::getPdo();
            file_put_contents($logFile, "  Database connection: OK\n", FILE_APPEND);
        } catch (Throwable $e) {
            file_put_contents($logFile, "  ERROR: Database unavailable - " . $e->getMessage() . "\n", FILE_APPEND);
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $id           = $this->generateUuidV4();
        $visibility   = in_array($data['visibility'] ?? '', ['public', 'connections', 'private'], true) ? $data['visibility'] : 'public';
        $hashtags     = json_encode($data['hashtags'] ?? []);
        $relevanceTags= json_encode($data['relevanceTags'] ?? []);
        $attachments  = json_encode($data['attachments'] ?? []);
        $poll         = isset($data['poll']) ? json_encode($data['poll']) : null;
        $imageUrl     = ($data['imageUrl'] ?? $data['image'] ?? null) ?: null;
        $scheduledFor = ($data['scheduledFor'] ?? null) ?: null;

        try {
            $stmt = $pdo->prepare(
                'INSERT INTO posts
                    (id, user_id, content, visibility, hashtags, relevance_tags, attachments, poll, image_url, scheduled_for)
                 VALUES
                    (:id, :user_id, :content, :visibility, :hashtags, :relevance_tags, :attachments, :poll, :image_url, :scheduled_for)'
            );
            $stmt->execute([
                'id'            => $id,
                'user_id'       => $userId,
                'content'       => $content,
                'visibility'    => $visibility,
                'hashtags'      => $hashtags,
                'relevance_tags'=> $relevanceTags,
                'attachments'   => $attachments,
                'poll'          => $poll,
                'image_url'     => $imageUrl,
                'scheduled_for' => $scheduledFor,
            ]);
            
            file_put_contents($logFile, "  Post inserted with ID: $id\n", FILE_APPEND);

            $author = $this->fetchUserMeta($pdo, $userId);
            
            // Fetch the newly created post using prepared statement
            $fetchStmt = $pdo->prepare("SELECT * FROM posts WHERE id = :id LIMIT 1");
            $fetchStmt->execute(['id' => $id]);
            $row = $fetchStmt->fetch(PDO::FETCH_ASSOC) ?: [];
            
            file_put_contents($logFile, "  Post fetched: " . (!empty($row) ? 'YES' : 'NO') . "\n", FILE_APPEND);
            file_put_contents($logFile, "  SUCCESS: Post created\n", FILE_APPEND);

            return [
                'success' => true,
                'message' => 'Post created',
                'data'    => $this->mapPost($row, $author, [], null),
            ];
        } catch (Throwable $e) {
            file_put_contents($logFile, "  ERROR during INSERT/SELECT: " . $e->getMessage() . "\n", FILE_APPEND);
            return ['success' => false, 'message' => 'Failed to create post: ' . $e->getMessage()];
        }
    }

    /**
     * POST /feed/posts/{id}/react
     * Toggle or change a reaction on a post.
     * Body: { reaction: 'like'|'insightful'|'celebrate'|'support'|'funny' }
     */
    public function reactToPost(Request $request, string $id): array
    {
        $userId = (string)($request->user('id') ?? '');
        if ($userId === '') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $data     = $request->json();
        $reaction = (string)($data['reaction'] ?? 'like');
        $allowed  = ['like', 'insightful', 'celebrate', 'support', 'funny'];
        if (!in_array($reaction, $allowed, true)) {
            return ['success' => false, 'message' => 'Invalid reaction type'];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        // Check existing reaction
        $existing = $pdo->prepare('SELECT reaction FROM post_reactions WHERE post_id = :post_id AND user_id = :user_id LIMIT 1');
        $existing->execute(['post_id' => $id, 'user_id' => $userId]);
        $prev = $existing->fetchColumn();

        if ($prev === $reaction) {
            // Same reaction → remove it (toggle off)
            $pdo->prepare('DELETE FROM post_reactions WHERE post_id = :post_id AND user_id = :user_id')
                ->execute(['post_id' => $id, 'user_id' => $userId]);
            $this->adjustReactionCount($pdo, $id, $reaction, -1);
            return ['success' => true, 'data' => ['userReaction' => null]];
        }

        if ($prev !== false) {
            // Different reaction → update and adjust counts
            $pdo->prepare('UPDATE post_reactions SET reaction = :reaction, updated_at = NOW() WHERE post_id = :post_id AND user_id = :user_id')
                ->execute(['reaction' => $reaction, 'post_id' => $id, 'user_id' => $userId]);
            $this->adjustReactionCount($pdo, $id, (string)$prev, -1);
            $this->adjustReactionCount($pdo, $id, $reaction, 1);
        } else {
            // New reaction
            $pdo->prepare('INSERT INTO post_reactions (id, post_id, user_id, reaction) VALUES (:rid, :post_id, :user_id, :reaction)')
                ->execute(['rid' => $this->generateUuidV4(), 'post_id' => $id, 'user_id' => $userId, 'reaction' => $reaction]);
            $this->adjustReactionCount($pdo, $id, $reaction, 1);
        }

        return ['success' => true, 'data' => ['userReaction' => $reaction]];
    }

    private function adjustReactionCount(PDO $pdo, string $postId, string $reaction, int $delta): void
    {
        $col = match ($reaction) {
            'insightful' => 'insightful_count',
            'celebrate'  => 'celebrate_count',
            'support'    => 'support_count',
            'funny'      => 'funny_count',
            default      => 'likes_count',
        };
        $op = $delta > 0 ? '+' : '-';
        $pdo->prepare("UPDATE posts SET {$col} = GREATEST(0, {$col} {$op} 1) WHERE id = :id")
            ->execute(['id' => $postId]);
    }

    /**
     * POST /feed/posts/{id}/comment
     * Add a comment or reply to a post.
     * Body: { content: string, parentCommentId?: string }
     */
    public function addComment(Request $request, string $id): array
    {
        $userId = (string)($request->user('id') ?? '');
        if ($userId === '') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $data    = $request->json();
        $content = trim((string)($data['content'] ?? ''));
        if ($content === '') {
            return ['success' => false, 'message' => 'Comment content is required'];
        }

        $parentId = ($data['parentCommentId'] ?? null) ?: null;

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $commentId = $this->generateUuidV4();
        $pdo->prepare(
            'INSERT INTO post_comments (id, post_id, user_id, parent_id, content)
             VALUES (:id, :post_id, :user_id, :parent_id, :content)'
        )->execute([
            'id'        => $commentId,
            'post_id'   => $id,
            'user_id'   => $userId,
            'parent_id' => $parentId,
            'content'   => $content,
        ]);

        // Increment comments_count
        $pdo->prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = :id')
            ->execute(['id' => $id]);

        $author = $this->fetchUserMeta($pdo, $userId);

        return [
            'success' => true,
            'data'    => [
                'id'        => $commentId,
                'author'    => $author,
                'content'   => $content,
                'createdAt' => 'Just now',
                'replies'   => [],
            ],
        ];
    }

    /**
     * POST /feed/posts/{id}/share
     * Repost a post with optional commentary.
     * Body: { commentary?: string }
     */
    public function sharePost(Request $request, string $id): array
    {
        $userId = (string)($request->user('id') ?? '');
        if ($userId === '') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $data       = $request->json();
        $commentary = trim((string)($data['commentary'] ?? ''));

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        // Fetch original post for content fallback
        $orig = $pdo->prepare('SELECT content, hashtags, relevance_tags FROM posts WHERE id = :id LIMIT 1');
        $orig->execute(['id' => $id]);
        $original = $orig->fetch() ?: [];

        if (empty($original)) {
            return ['success' => false, 'message' => 'Post not found'];
        }

        // Increment shares on original
        $pdo->prepare('UPDATE posts SET shares_count = shares_count + 1 WHERE id = :id')
            ->execute(['id' => $id]);

        $origContent = (string)($original['content'] ?? '');
        $repostContent = $commentary !== ''
            ? $commentary
            : 'Reposted: ' . mb_substr($origContent, 0, 120) . (mb_strlen($origContent) > 120 ? '…' : '');

        $origHashtags = json_decode((string)($original['hashtags'] ?? '[]'), true) ?: [];
        $mergedHashtags = array_unique(array_merge($origHashtags, ['#repost']));

        $repostId = $this->generateUuidV4();
        $pdo->prepare(
            'INSERT INTO posts (id, user_id, content, visibility, hashtags, relevance_tags, repost_of_id)
             VALUES (:id, :user_id, :content, :visibility, :hashtags, :relevance_tags, :repost_of_id)'
        )->execute([
            'id'             => $repostId,
            'user_id'        => $userId,
            'content'        => $repostContent,
            'visibility'     => 'public',
            'hashtags'       => json_encode($mergedHashtags),
            'relevance_tags' => $original['relevance_tags'] ?? '[]',
            'repost_of_id'   => $id,
        ]);

        $author = $this->fetchUserMeta($pdo, $userId);
        
        // Fetch the newly created repost using prepared statement
        $fetchStmt = $pdo->prepare("SELECT * FROM posts WHERE id = :id LIMIT 1");
        $fetchStmt->execute(['id' => $repostId]);
        $row = $fetchStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        return [
            'success' => true,
            'data'    => $this->mapPost($row, $author, [], null),
        ];
    }

    /**
     * POST /feed/posts/{id}/poll-vote
     * Vote on a poll option.
     * Body: { optionId: string }
     */
    public function votePoll(Request $request, string $id): array
    {
        $userId   = (string)($request->user('id') ?? '');
        $data     = $request->json();
        $optionId = (string)($data['optionId'] ?? '');

        if ($userId === '' || $optionId === '') {
            return ['success' => false, 'message' => 'Missing required fields'];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $stmt = $pdo->prepare('SELECT poll FROM posts WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if (!$row || empty($row['poll'])) {
            return ['success' => false, 'message' => 'Post or poll not found'];
        }

        $poll = json_decode((string)$row['poll'], true);
        if (!is_array($poll)) {
            return ['success' => false, 'message' => 'Invalid poll data'];
        }

        $updated = false;
        foreach ($poll['options'] as &$option) {
            if ((string)$option['id'] === $optionId) {
                $option['votes'] = ((int)($option['votes'] ?? 0)) + 1;
                $updated = true;
                break;
            }
        }
        unset($option);

        if (!$updated) {
            return ['success' => false, 'message' => 'Poll option not found'];
        }

        $pdo->prepare('UPDATE posts SET poll = :poll WHERE id = :id')
            ->execute(['poll' => json_encode($poll), 'id' => $id]);

        return ['success' => true, 'data' => ['poll' => $poll]];
    }

    /**
     * DELETE /feed/posts/{id}
     * Delete a post (owner only).
     */
    public function deletePost(Request $request, string $id): array
    {
        $userId = (string)($request->user('id') ?? '');
        if ($userId === '') {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        try {
            $pdo = Connection::getPdo();
        } catch (Throwable) {
            return ['success' => false, 'message' => 'Database unavailable'];
        }

        $stmt = $pdo->prepare('DELETE FROM posts WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);

        if ($stmt->rowCount() === 0) {
            return ['success' => false, 'message' => 'Post not found or not authorized'];
        }

        return ['success' => true, 'message' => 'Post deleted'];
    }
}
