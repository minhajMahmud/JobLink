<?php

namespace App\Core\Events;

class EventDispatcher
{
    private static ?EventDispatcher $instance = null;
    private array $listeners = [];
    private array $history = [];

    private function __construct() {}

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register an event listener
     */
    public function subscribe(string $eventName, callable $listener): void
    {
        if (!isset($this->listeners[$eventName])) {
            $this->listeners[$eventName] = [];
        }
        $this->listeners[$eventName][] = $listener;
    }

    /**
     * Register a listener class
     */
    public function subscribeListener(EventListener $listener): void
    {
        foreach ($listener::subscribedTo() as $eventName) {
            $this->subscribe($eventName, [$listener, 'handle']);
        }
    }

    /**
     * Dispatch an event to all registered listeners
     */
    public function dispatch(Event $event): void
    {
        $eventName = $event->getName();
        
        $this->history[] = [
            'event' => $eventName,
            'data' => $event->getData(),
            'timestamp' => new \DateTime(),
        ];

        if (!isset($this->listeners[$eventName])) {
            return;
        }

        foreach ($this->listeners[$eventName] as $listener) {
            try {
                $listener($event);
            } catch (\Exception $e) {
                error_log("Event listener error for {$eventName}: {$e->getMessage()}");
            }
        }
    }

    /**
     * Get event history (for debugging)
     */
    public function getHistory(int $limit = 100): array
    {
        return array_slice($this->history, -$limit);
    }

    /**
     * Clear event history
     */
    public function clearHistory(): void
    {
        $this->history = [];
    }
}
