<?php

declare(strict_types=1);

namespace App\Modules\User\Models;

final class Experience
{
    public string $id;
    public string $candidateId;
    public string $title;
    public string $company;
    public ?string $startDate;
    public ?string $endDate;
    public bool $isCurrent;
    public ?string $description;
    public string $createdAt;
    public string $updatedAt;

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $exp = new self();
        $exp->id = (string)($data['id'] ?? '');
        $exp->candidateId = (string)($data['candidate_id'] ?? '');
        $exp->title = (string)($data['title'] ?? '');
        $exp->company = (string)($data['company'] ?? '');
        $exp->startDate = isset($data['start_date']) ? (string)$data['start_date'] : null;
        $exp->endDate = isset($data['end_date']) ? (string)$data['end_date'] : null;
        $exp->isCurrent = (bool)($data['is_current'] ?? false);
        $exp->description = isset($data['description']) ? (string)$data['description'] : null;
        $exp->createdAt = (string)($data['created_at'] ?? date('Y-m-d H:i:s'));
        $exp->updatedAt = (string)($data['updated_at'] ?? date('Y-m-d H:i:s'));
        
        return $exp;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'candidate_id' => $this->candidateId,
            'title' => $this->title,
            'company' => $this->company,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'is_current' => $this->isCurrent,
            'description' => $this->description,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
