<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Repositories\AdminRepository;

final class AdminService
{
    public function __construct(private AdminRepository $repository)
    {
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getUsers(array $filters, int $page, int $limit): array
    {
        return $this->repository->getUsers($filters, $page, $limit);
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getEmployers(array $filters, int $page, int $limit): array
    {
        return $this->repository->getEmployers($filters, $page, $limit);
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getPosts(array $filters, int $page, int $limit): array
    {
        return $this->repository->getPosts($filters, $page, $limit);
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getJobs(array $filters, int $page, int $limit): array
    {
        return $this->repository->getJobs($filters, $page, $limit);
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function getReports(array $filters, int $page, int $limit): array
    {
        return $this->repository->getReports($filters, $page, $limit);
    }

    /**
     * @return array<string, mixed>
     */
    public function getAnalytics(string $range): array
    {
        return $this->repository->getAnalytics($range);
    }

    /**
     * @return array<string, mixed>
     */
    public function getRbacMatrix(): array
    {
        return $this->repository->getRbacMatrix();
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function moderate(string $module, string $entityId, array $payload, array $actor = []): array
    {
        return $this->repository->moderateEntity($module, $entityId, $payload, $actor);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function resolveReport(string $reportId, array $payload, array $actor = []): array
    {
        return $this->repository->resolveReport($reportId, $payload, $actor);
    }

    /**
     * @return array<string, mixed>
     */
    public function updateUserStatus(string $userId, string $status, array $actor = []): array
    {
        return $this->repository->updateUserStatus($userId, $status, $actor);
    }

    /**
     * @return array<string, mixed>
     */
    public function deleteUser(string $userId, array $actor = []): array
    {
        return $this->repository->deleteUser($userId, $actor);
    }

    /**
     * @return array<string, mixed>
     */
    public function verifyEmployer(string $employerId, bool $isVerified, array $actor = []): array
    {
        return $this->repository->verifyEmployer($employerId, $isVerified, $actor);
    }

    /**
     * @return array<string, mixed>
     */
    public function getSpamAlerts(): array
    {
        return $this->repository->getSpamAlerts();
    }
}
