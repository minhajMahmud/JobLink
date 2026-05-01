<?php

declare(strict_types=1);

namespace App\Modules\User\Repositories;

use App\Core\Database\Connection;
use App\Modules\User\Models\User;
use App\Modules\User\Models\CandidateProfile;
use App\Modules\User\Models\Experience;
use App\Modules\User\Models\Education;
use PDO;

final class UserRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Connection::getPdo();
    }

    /**
     * Find user by ID
     */
    public function findById(string $id): ?User
    {
        $sql = "SELECT * FROM users WHERE id = :id LIMIT 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        return User::fromArray($row);
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        $sql = "SELECT * FROM users WHERE email = :email LIMIT 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        return User::fromArray($row);
    }

    /**
     * Update user profile
     * 
     * @param array<string, mixed> $data
     */
    public function updateUser(string $userId, array $data): bool
    {
        $allowedFields = [
            'first_name', 'last_name', 'phone', 'avatar_url', 
            'headline', 'location', 'website', 'bio'
        ];
        
        $updates = [];
        $params = ['id' => $userId];
        
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $updates[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            return true; // Nothing to update
        }
        
        $sql = "UPDATE users SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = :id";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Get candidate profile by user ID
     */
    public function getCandidateProfile(string $userId): ?CandidateProfile
    {
        $sql = "SELECT * FROM candidates WHERE user_id = :user_id LIMIT 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        return CandidateProfile::fromArray($row);
    }

    /**
     * Update candidate profile
     * 
     * @param array<string, mixed> $data
     */
    public function updateCandidateProfile(string $userId, array $data): bool
    {
        // First, check if candidate profile exists
        $checkSql = "SELECT id FROM candidates WHERE user_id = :user_id LIMIT 1";
        $checkStmt = $this->pdo->prepare($checkSql);
        $checkStmt->execute(['user_id' => $userId]);
        $exists = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$exists) {
            // Create candidate profile if it doesn't exist
            $insertSql = "INSERT INTO candidates (id, user_id, skills, experience_years, education_level) 
                          VALUES (:id, :user_id, :skills, :experience_years, :education_level)";
            $insertStmt = $this->pdo->prepare($insertSql);
            return $insertStmt->execute([
                'id' => $this->generateUuid(),
                'user_id' => $userId,
                'skills' => json_encode($data['skills'] ?? []),
                'experience_years' => (int)($data['experience_years'] ?? 0),
                'education_level' => (string)($data['education_level'] ?? 'Bachelor'),
            ]);
        }
        
        // Update existing profile
        $allowedFields = [
            'skills', 'experience_years', 'education_level', 
            'availability_status', 'salary_min', 'salary_max', 'resume_url'
        ];
        
        $updates = [];
        $params = ['user_id' => $userId];
        
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $updates[] = "$field = :$field";
                
                // Special handling for JSON fields
                if ($field === 'skills') {
                    $params[$field] = is_array($data[$field]) ? json_encode($data[$field]) : $data[$field];
                } else {
                    $params[$field] = $data[$field];
                }
            }
        }
        
        if (empty($updates)) {
            return true;
        }
        
        $sql = "UPDATE candidates SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE user_id = :user_id";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Get candidate experiences
     * 
     * @return array<Experience>
     */
    public function getExperiences(string $candidateId): array
    {
        $sql = "SELECT * FROM candidate_experiences 
                WHERE candidate_id = :candidate_id 
                ORDER BY is_current DESC, start_date DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['candidate_id' => $candidateId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn(array $row): Experience => Experience::fromArray($row), $rows);
    }

    /**
     * Get candidate education
     * 
     * @return array<Education>
     */
    public function getEducation(string $candidateId): array
    {
        $sql = "SELECT * FROM candidate_education 
                WHERE candidate_id = :candidate_id 
                ORDER BY is_current DESC, start_date DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['candidate_id' => $candidateId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn(array $row): Education => Education::fromArray($row), $rows);
    }

    /**
     * Add experience
     * 
     * @param array<string, mixed> $data
     */
    public function addExperience(string $candidateId, array $data): string
    {
        $id = $this->generateUuid();
        
        $sql = "INSERT INTO candidate_experiences 
                (id, candidate_id, title, company, start_date, end_date, is_current, description)
                VALUES 
                (:id, :candidate_id, :title, :company, :start_date, :end_date, :is_current, :description)";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'title' => $data['title'],
            'company' => $data['company'],
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => (bool)($data['is_current'] ?? false),
            'description' => $data['description'] ?? null,
        ]);
        
        return $id;
    }

    /**
     * Add education
     * 
     * @param array<string, mixed> $data
     */
    public function addEducation(string $candidateId, array $data): string
    {
        $id = $this->generateUuid();
        
        $sql = "INSERT INTO candidate_education 
                (id, candidate_id, degree, school, field_of_study, start_date, end_date, is_current, grade, description)
                VALUES 
                (:id, :candidate_id, :degree, :school, :field_of_study, :start_date, :end_date, :is_current, :grade, :description)";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'candidate_id' => $candidateId,
            'degree' => $data['degree'],
            'school' => $data['school'],
            'field_of_study' => $data['field_of_study'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_current' => (bool)($data['is_current'] ?? false),
            'grade' => $data['grade'] ?? null,
            'description' => $data['description'] ?? null,
        ]);
        
        return $id;
    }

    /**
     * Delete experience
     */
    public function deleteExperience(string $experienceId, string $candidateId): bool
    {
        $sql = "DELETE FROM candidate_experiences WHERE id = :id AND candidate_id = :candidate_id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $experienceId, 'candidate_id' => $candidateId]);
    }

    /**
     * Delete education
     */
    public function deleteEducation(string $educationId, string $candidateId): bool
    {
        $sql = "DELETE FROM candidate_education WHERE id = :id AND candidate_id = :candidate_id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $educationId, 'candidate_id' => $candidateId]);
    }

    /**
     * Generate UUID v4
     */
    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
