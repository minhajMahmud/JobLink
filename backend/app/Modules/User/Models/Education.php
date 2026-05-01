<?php

declare(strict_types=1);

namespace App\Modules\User\Models;

final class Education
{
    public string $id;
    public string $candidateId;
    public string $degree;
    public string $school;
    public ?string $fieldOfStudy;
    public ?string $startDate;
    public ?string $endDate;
    public bool $isCurrent;
    public ?string $grade;
    public ?string $description;
    public string $createdAt;
    public string $updatedAt;

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $edu = new self();
        $edu->id = (string)($data['id'] ?? '');
        $edu->candidateId = (string)($data['candidate_id'] ?? '');
        $edu->degree = (string)($data['degree'] ?? '');
        $edu->school = (string)($data['school'] ?? '');
        $edu->fieldOfStudy = isset($data['field_of_study']) ? (string)$data['field_of_study'] : null;
        $edu->startDate = isset($data['start_date']) ? (string)$data['start_date'] : null;
        $edu->endDate = isset($data['end_date']) ? (string)$data['end_date'] : null;
        $edu->isCurrent = (bool)($data['is_current'] ?? false);
        $edu->grade = isset($data['grade']) ? (string)$data['grade'] : null;
        $edu->description = isset($data['description']) ? (string)$data['description'] : null;
        $edu->createdAt = (string)($data['created_at'] ?? date('Y-m-d H:i:s'));
        $edu->updatedAt = (string)($data['updated_at'] ?? date('Y-m-d H:i:s'));
        
        return $edu;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'candidate_id' => $this->candidateId,
            'degree' => $this->degree,
            'school' => $this->school,
            'field_of_study' => $this->fieldOfStudy,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'is_current' => $this->isCurrent,
            'grade' => $this->grade,
            'description' => $this->description,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
