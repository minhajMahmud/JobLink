<?php

declare(strict_types=1);

namespace App\Core\Http;

final class Response
{
    private mixed $data;
    private int $status;

    private function __construct(mixed $data, int $status)
    {
        $this->data = $data;
        $this->status = $status;
    }

    public static function json(mixed $data, int $status = 200): self
    {
        return new self($data, $status);
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function getData(): mixed
    {
        return $this->data;
    }

    public function send(): void
    {
        if (!headers_sent()) {
            http_response_code($this->status);
            header('Content-Type: application/json; charset=utf-8');
            
            // CORS headers - allow all origins for development
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID, X-User-Role, x-user-id, x-user-role');
            header('Access-Control-Allow-Credentials: false');
            header('Access-Control-Max-Age: 3600');
        }

        echo json_encode($this->data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
