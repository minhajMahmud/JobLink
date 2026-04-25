<?php

namespace App\Core\Events;

interface Event
{
    /**
     * Get the event name
     */
    public function getName(): string;

    /**
     * Get the event data
     */
    public function getData(): array;
}
