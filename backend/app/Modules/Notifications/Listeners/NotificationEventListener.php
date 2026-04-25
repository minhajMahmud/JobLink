<?php

namespace App\Modules\Notifications\Listeners;

use App\Core\Events\Event;
use App\Core\Events\EventListener;
use App\Modules\Notifications\Events\ApplicationStatusChangedEvent;
use App\Modules\Notifications\Events\InterviewScheduledEvent;
use App\Modules\Notifications\Events\MessageReceivedEvent;
use App\Modules\Notifications\Models\Notification;
use App\Modules\Notifications\Repositories\NotificationRepository;

class NotificationEventListener implements EventListener
{
    private NotificationRepository $notificationRepository;

    public function __construct(NotificationRepository $notificationRepository)
    {
        $this->notificationRepository = $notificationRepository;
    }

    public static function subscribedTo(): array
    {
        return [
            'notification.application.status_changed',
            'notification.interview.scheduled',
            'notification.message.received',
        ];
    }

    public function handle(Event $event): void
    {
        match ($event->getName()) {
            'notification.application.status_changed' => $this->handleApplicationStatusChanged($event),
            'notification.interview.scheduled' => $this->handleInterviewScheduled($event),
            'notification.message.received' => $this->handleMessageReceived($event),
            default => null,
        };
    }

    private function handleApplicationStatusChanged(ApplicationStatusChangedEvent $event): void
    {
        $data = $event->getData();
        
        $statusMessages = [
            'accepted' => "Application accepted by {$data['companyName']} for {$data['jobTitle']}!",
            'rejected' => "Your application was not selected for {$data['jobTitle']} at {$data['companyName']}.",
            'interview' => "{$data['companyName']} is interested in {$data['jobTitle']} — next step is an interview!",
            'under_review' => "Your application for {$data['jobTitle']} at {$data['companyName']} is under review.",
        ];

        $description = $statusMessages[$data['status']] ?? "Application status updated";

        $notification = new Notification(
            $data['userId'],
            'application',
            ucfirst(str_replace('_', ' ', $data['status'])) . " — {$data['jobTitle']}",
            $description,
            '/jobs',
            $data['status'] === 'accepted' ? 'high' : 'medium'
        );

        $this->notificationRepository->save($notification);
    }

    private function handleInterviewScheduled(InterviewScheduledEvent $event): void
    {
        $data = $event->getData();
        
        $notification = new Notification(
            $data['userId'],
            'interview',
            "Interview scheduled for {$data['jobTitle']}",
            "Interview with {$data['interviewerName']} on {$data['scheduledAt']}",
            '/messages',
            'high'
        );

        $this->notificationRepository->save($notification);
    }

    private function handleMessageReceived(MessageReceivedEvent $event): void
    {
        $data = $event->getData();
        
        $notification = new Notification(
            $data['recipientId'],
            'message',
            "New message from {$data['senderName']}",
            "You have a new message. Click to view.",
            '/messages',
            'medium'
        );

        $this->notificationRepository->save($notification);
    }
}
