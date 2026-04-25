<?php

namespace App\Modules\Notifications\Events;

use App\Core\Events\Event;

class MessageReceivedEvent implements Event
{
    private int $recipientId;
    private int $senderId;
    private string $senderName;

    public function __construct(int $recipientId, int $senderId, string $senderName)
    {
        $this->recipientId = $recipientId;
        $this->senderId = $senderId;
        $this->senderName = $senderName;
    }

    public function getName(): string
    {
        return 'notification.message.received';
    }

    public function getData(): array
    {
        return [
            'recipientId' => $this->recipientId,
            'senderId' => $this->senderId,
            'senderName' => $this->senderName,
        ];
    }
}
