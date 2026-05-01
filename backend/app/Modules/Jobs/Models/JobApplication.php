<?php

declare(strict_types=1);

namespace App\Modules\Jobs\Models;

final class JobApplication
{
    public string $id;
    public string $jobId;
    public string $candidateId;
    public string $status;
    public int $matchScore;
    public ?string $coverLetter;
    public ?string $resumeUrl;
    public ?string $resumeFilePath;
    public ?string $notes;
    public string $appliedAt;
    public string $updatedAt;

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $application = new self();
        $application->id = (string)($data['id'] ?? '');
        $application->jobId = (string)($data['job_id'] ?? '');
        $application->candidateId = (string)($data['candidate_id'] ?? '');
        $application->status = (string)($data['status'] ?? 'Applied');
        $application->matchScore = (int)($data['match_score'] ?? 0);
        $application->coverLetter = isset($data['cover_letter']) ? (string)$data['cover_letter'] : null;
        $application->resumeUrl = isset($data['resume_url']) ? (string)$data['resume_url'] : null;
        $application->resumeFilePath = isset($data['resume_file_path']) ? (string)$data['resume_file_path'] : null;
        $application->notes = isset($data['notes']) ? (string)$data['notes'] : null;
        $application->appliedAt = (string)($data['applied_at'] ?? date('Y-m-d H:i:s'));
        $application->updatedAt = (string)($data['updated_at'] ?? date('Y-m-d H:i:s'));
        
        return $application;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'job_id' => $this->jobId,
            'candidate_id' => $this->candidateId,
            'status' => $this->status,
            'match_score' => $this->matchScore,
            'cover_letter' => $this->coverLetter,
            'resume_url' => $this->resumeUrl,
            'resume_file_path' => $this->resumeFilePath,
            'notes' => $this->notes,
            'applied_at' => $this->appliedAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
