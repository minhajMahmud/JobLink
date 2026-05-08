<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Models;

final class Message
{
    public function __construct(
        public string $id,
        public string $conversation_id,
        public string $sender_id,
        public ?string $content = null,
        public string $message_type = 'text',
        public bool $is_deleted = false,
        public string $created_at = '',
        public string $updated_at = '',
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? '',
            conversation_id: $data['conversation_id'] ?? '',
            sender_id: $data['sender_id'] ?? '',
            content: $data['content'] ?? null,
            message_type: $data['message_type'] ?? 'text',
            is_deleted: (bool) ($data['is_deleted'] ?? false),
            created_at: $data['created_at'] ?? '',
            updated_at: $data['updated_at'] ?? '',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'content' => $this->content,
            'message_type' => $this->message_type,
            'is_deleted' => $this->is_deleted,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
