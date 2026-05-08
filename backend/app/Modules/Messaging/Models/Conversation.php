<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Models;

final class Conversation
{
    public function __construct(
        public string $id,
        public string $participant_1_id,
        public string $participant_2_id,
        public ?string $last_message_id = null,
        public ?string $last_message_at = null,
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
            participant_1_id: $data['participant_1_id'] ?? '',
            participant_2_id: $data['participant_2_id'] ?? '',
            last_message_id: $data['last_message_id'] ?? null,
            last_message_at: $data['last_message_at'] ?? null,
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
            'participant_1_id' => $this->participant_1_id,
            'participant_2_id' => $this->participant_2_id,
            'last_message_id' => $this->last_message_id,
            'last_message_at' => $this->last_message_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
