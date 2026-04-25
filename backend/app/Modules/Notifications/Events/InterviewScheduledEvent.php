<?php

namespace App\Modules\Notifications\Events;

use App\Core\Events\Event;

class InterviewScheduledEvent implements Event
{
    private int $userId;
    private string $interviewerName;
    private string $jobTitle;
    private \DateTime $scheduledAt;

    public function __construct(int $userId, string $interviewerName, string $jobTitle, \DateTime $scheduledAt)
    {
        $this->userId = $userId;
        $this->interviewerName = $interviewerName;
        $this->jobTitle = $jobTitle;
        $this->scheduledAt = $scheduledAt;
    }

    public function getName(): string
    {
        return 'notification.interview.scheduled';
    }

    public function getData(): array
    {
        return [
            'userId' => $this->userId,
            'interviewerName' => $this->interviewerName,
            'jobTitle' => $this->jobTitle,
            'scheduledAt' => $this->scheduledAt->format('Y-m-d H:i:s'),
        ];
    }
}
