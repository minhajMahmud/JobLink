<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Repositories;

use App\Core\Database\Connection;
use App\Modules\Messaging\Models\Attachment;
use PDO;

final class AttachmentRepository
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
     * Create attachment record
     */
    public function createAttachment(
        string $messageId,
        string $fileName,
        string $filePath,
        ?string $fileType = null,
        ?int $fileSize = null,
        ?string $mimeType = null
    ): Attachment {
        $id = $this->generateUuidV4();
        $stmt = $this->pdo->prepare('
            INSERT INTO attachments (id, message_id, file_name, file_path, file_type, file_size, mime_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$id, $messageId, $fileName, $filePath, $fileType, $fileSize, $mimeType]);

        return new Attachment(
            id: $id,
            message_id: $messageId,
            file_name: $fileName,
            file_path: $filePath,
            file_type: $fileType,
            file_size: $fileSize,
            mime_type: $mimeType,
        );
    }

    /**
     * Get attachments for a message
     * @return array<int, Attachment>
     */
    public function getMessageAttachments(string $messageId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM attachments WHERE message_id = ?');
        $stmt->execute([$messageId]);
        $results = $stmt->fetchAll();

        return array_map(fn($row) => Attachment::fromArray($row), $results);
    }

    /**
     * Get attachment by ID
     */
    public function getAttachmentById(string $attachmentId): ?Attachment
    {
        $stmt = $this->pdo->prepare('SELECT * FROM attachments WHERE id = ?');
        $stmt->execute([$attachmentId]);
        $result = $stmt->fetch();

        return $result ? Attachment::fromArray($result) : null;
    }

    /**
     * Delete attachment
     */
    public function deleteAttachment(string $attachmentId): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM attachments WHERE id = ?');
        $stmt->execute([$attachmentId]);
    }
}
