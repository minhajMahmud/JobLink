<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Models;

final class Attachment
{
    public function __construct(
        public string $id,
        public string $message_id,
        public string $file_name,
        public string $file_path,
        public ?string $file_type = null,
        public ?int $file_size = null,
        public ?string $mime_type = null,
        public string $created_at = '',
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? '',
            message_id: $data['message_id'] ?? '',
            file_name: $data['file_name'] ?? '',
            file_path: $data['file_path'] ?? '',
            file_type: $data['file_type'] ?? null,
            file_size: isset($data['file_size']) ? (int) $data['file_size'] : null,
            mime_type: $data['mime_type'] ?? null,
            created_at: $data['created_at'] ?? '',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'message_id' => $this->message_id,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'created_at' => $this->created_at,
        ];
    }
}
