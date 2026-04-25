<?php

namespace App\Modules\Notifications\Models;

class Notification
{
    public int $id;
    public int $userId;
    public string $category;
    public string $title;
    public string $description;
    public ?string $href;
    public bool $read;
    public string $priority;
    public \DateTime $createdAt;
    public ?\DateTime $readAt;

    public function __construct(
        int $userId,
        string $category,
        string $title,
        string $description,
        ?string $href = null,
        string $priority = 'medium'
    ) {
        $this->userId = $userId;
        $this->category = $category;
        $this->title = $title;
        $this->description = $description;
        $this->href = $href;
        $this->read = false;
        $this->priority = $priority;
        $this->createdAt = new \DateTime();
        $this->readAt = null;
    }

    public function markAsRead(): self
    {
        $this->read = true;
        $this->readAt = new \DateTime();
        return $this;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id ?? null,
            'userId' => $this->userId,
            'category' => $this->category,
            'title' => $this->title,
            'description' => $this->description,
            'href' => $this->href,
            'read' => $this->read,
            'priority' => $this->priority,
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'readAt' => $this->readAt?->format('Y-m-d H:i:s'),
        ];
    }
}
