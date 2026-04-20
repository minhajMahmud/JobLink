<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Middleware\RoleValidationMiddleware;
use App\Modules\Admin\Repositories\AdminRepository;
use App\Modules\Admin\Services\AdminService;

final class AdminController
{
    private AdminService $service;
    private RoleValidationMiddleware $rbac;

    public function __construct()
    {
        $this->service = new AdminService(new AdminRepository());
        $this->rbac = new RoleValidationMiddleware();
    }

    private function ensureAdmin(Request $request): ?Response
    {
        if (!$this->rbac->authorize($request, ['admin'])) {
            return Response::json(['error' => 'Unauthorized'], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function actorContext(Request $request): array
    {
        return [
            'id' => (string)($request->user('id') ?? 'unknown'),
            'role' => (string)($request->user('role') ?? 'unknown'),
            'ip_address' => (string)($request->header('x-forwarded-for') ?? $request->header('x-real-ip') ?? ''),
            'user_agent' => (string)($request->header('user-agent') ?? ''),
        ];
    }

    public function getUsers(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $page = (int)($request->query('page') ?? 1);
        $limit = (int)($request->query('limit') ?? 20);

        return Response::json(
            $this->service->getUsers([
                'query' => $request->query('query'),
                'role' => $request->query('role'),
                'status' => $request->query('status'),
            ], $page, $limit),
            200
        );
    }

    public function updateUserStatus(Request $request, string $userId): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $payload = json_decode($request->getBody(), true) ?? [];

        return Response::json(
            $this->service->updateUserStatus($userId, (string)($payload['status'] ?? 'Active'), $this->actorContext($request)),
            200
        );
    }

    public function deleteUser(Request $request, string $userId): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        return Response::json($this->service->deleteUser($userId, $this->actorContext($request)), 200);
    }

    public function getEmployers(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $page = (int)($request->query('page') ?? 1);
        $limit = (int)($request->query('limit') ?? 20);

        return Response::json(
            $this->service->getEmployers([
                'query' => $request->query('query'),
                'status' => $request->query('status'),
            ], $page, $limit),
            200
        );
    }

    public function verifyEmployer(Request $request, string $employerId): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $payload = json_decode($request->getBody(), true) ?? [];

        return Response::json(
            $this->service->verifyEmployer($employerId, (bool)($payload['is_verified'] ?? false), $this->actorContext($request)),
            200
        );
    }

    public function getPosts(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $page = (int)($request->query('page') ?? 1);
        $limit = (int)($request->query('limit') ?? 20);

        return Response::json(
            $this->service->getPosts([
                'query' => $request->query('query'),
                'status' => $request->query('status'),
            ], $page, $limit),
            200
        );
    }

    public function moderatePost(Request $request, string $postId): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $payload = json_decode($request->getBody(), true) ?? [];

        return Response::json($this->service->moderate('post', $postId, $payload, $this->actorContext($request)), 200);
    }

    public function getJobs(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $page = (int)($request->query('page') ?? 1);
        $limit = (int)($request->query('limit') ?? 20);

        return Response::json(
            $this->service->getJobs([
                'query' => $request->query('query'),
                'status' => $request->query('status'),
            ], $page, $limit),
            200
        );
    }

    public function moderateJob(Request $request, string $jobId): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $payload = json_decode($request->getBody(), true) ?? [];

        return Response::json($this->service->moderate('job', $jobId, $payload, $this->actorContext($request)), 200);
    }

    public function getAnalytics(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $range = (string)($request->query('range') ?? '7d');

        return Response::json($this->service->getAnalytics($range), 200);
    }

    public function getReports(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $page = (int)($request->query('page') ?? 1);
        $limit = (int)($request->query('limit') ?? 20);

        return Response::json(
            $this->service->getReports([
                'query' => $request->query('query'),
                'status' => $request->query('status'),
                'priority' => $request->query('priority'),
            ], $page, $limit),
            200
        );
    }

    public function resolveReport(Request $request, string $reportId): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        $payload = json_decode($request->getBody(), true) ?? [];

        return Response::json($this->service->resolveReport($reportId, $payload, $this->actorContext($request)), 200);
    }

    public function getSpamAlerts(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        return Response::json($this->service->getSpamAlerts(), 200);
    }

    public function getRbacMatrix(Request $request): Response
    {
        if ($unauthorized = $this->ensureAdmin($request)) {
            return $unauthorized;
        }

        return Response::json($this->service->getRbacMatrix(), 200);
    }
}
