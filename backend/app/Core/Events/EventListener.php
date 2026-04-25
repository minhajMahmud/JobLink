<?php

namespace App\Core\Events;

interface EventListener
{
    /**
     * Handle the event
     */
    public function handle(Event $event): void;

    /**
     * Get the events this listener subscribes to
     */
    public static function subscribedTo(): array;
}
