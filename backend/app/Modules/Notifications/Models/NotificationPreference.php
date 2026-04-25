<?php

namespace App\Modules\Notifications\Models;

class NotificationPreference
{
    public int $id;
    public int $userId;
    public string $category;
    public bool $emailEnabled;
    public bool $pushEnabled;
    public bool $inAppEnabled;
    public \DateTime $updatedAt;

    public function __construct(
        int $userId,
        string $category,
        bool $emailEnabled = true,
        bool $pushEnabled = true,
        bool $inAppEnabled = true
    ) {
        $this->userId = $userId;
        $this->category = $category;
        $this->emailEnabled = $emailEnabled;
        $this->pushEnabled = $pushEnabled;
        $this->inAppEnabled = $inAppEnabled;
        $this->updatedAt = new \DateTime();
    }

    public function update(bool $emailEnabled, bool $pushEnabled, bool $inAppEnabled): self
    {
        $this->emailEnabled = $emailEnabled;
        $this->pushEnabled = $pushEnabled;
        $this->inAppEnabled = $inAppEnabled;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id ?? null,
            'userId' => $this->userId,
            'category' => $this->category,
            'emailEnabled' => $this->emailEnabled,
            'pushEnabled' => $this->pushEnabled,
            'inAppEnabled' => $this->inAppEnabled,
            'updatedAt' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
