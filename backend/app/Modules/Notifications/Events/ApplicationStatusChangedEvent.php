<?php

namespace App\Modules\Notifications\Events;

use App\Core\Events\Event;

class ApplicationStatusChangedEvent implements Event
{
    private int $userId;
    private int $jobId;
    private string $status;
    private string $companyName;
    private string $jobTitle;

    public function __construct(int $userId, int $jobId, string $status, string $companyName, string $jobTitle)
    {
        $this->userId = $userId;
        $this->jobId = $jobId;
        $this->status = $status;
        $this->companyName = $companyName;
        $this->jobTitle = $jobTitle;
    }

    public function getName(): string
    {
        return 'notification.application.status_changed';
    }

    public function getData(): array
    {
        return [
            'userId' => $this->userId,
            'jobId' => $this->jobId,
            'status' => $this->status,
            'companyName' => $this->companyName,
            'jobTitle' => $this->jobTitle,
        ];
    }
}
