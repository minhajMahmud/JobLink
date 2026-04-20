<?php

declare(strict_types=1);

namespace App\Core\Http;

final class Request
{
    private string $method;
    private string $path;

    /** @var array<string, mixed> */
    private array $query;

    /** @var array<string, string> */
    private array $headers;

    /** @var array<string, string> */
    private array $routeParams;

    /** @var array<string, mixed> */
    private array $user;

    private string $body;

    /**
     * @param array<string, string> $headers
     * @param array<string, mixed> $query
     * @param array<string, mixed> $user
     * @param array<string, string> $routeParams
     */
    public function __construct(
        string $method = 'GET',
        string $path = '/',
        array $query = [],
        string $body = '',
        array $headers = [],
        array $user = [],
        array $routeParams = []
    ) {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->query = $query;
        $this->body = $body;
        $this->headers = $headers;
        $this->user = $user;
        $this->routeParams = $routeParams;
    }

    public static function fromGlobals(): self
    {
        $rawBody = file_get_contents('php://input');

        $uriPath = (string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $normalizedHeaders = [];
        foreach ($headers as $key => $value) {
            $normalizedHeaders[strtolower((string)$key)] = (string)$value;
        }

        return new self(
            (string)($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            $uriPath !== '' ? $uriPath : '/',
            $_GET ?? [],
            is_string($rawBody) ? $rawBody : '',
            $normalizedHeaders,
            []
        );
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    /**
     * @return array<string, mixed>
     */
    public function json(): array
    {
        $decoded = json_decode($this->body, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function header(string $key, ?string $default = null): ?string
    {
        $normalizedKey = strtolower($key);

        return $this->headers[$normalizedKey] ?? $default;
    }

    public function route(string $key, ?string $default = null): ?string
    {
        return $this->routeParams[$key] ?? $default;
    }

    /**
     * @param array<string, string> $params
     */
    public function setRouteParams(array $params): void
    {
        $this->routeParams = $params;
    }

    public function user(string $key, mixed $default = null): mixed
    {
        return $this->user[$key] ?? $default;
    }

    /**
     * @param array<string, mixed> $user
     */
    public function setUser(array $user): void
    {
        $this->user = $user;
    }
}
