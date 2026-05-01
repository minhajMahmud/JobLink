<?php

declare(strict_types=1);

namespace App\Modules\User\Models;

final class User
{
    public string $id;
    public string $email;
    public string $firstName;
    public string $lastName;
    public string $role;
    public string $status;
    public ?string $phone;
    public ?string $avatarUrl;
    public ?string $headline;
    public ?string $location;
    public ?string $website;
    public ?string $bio;
    public ?string $emailVerifiedAt;
    public ?string $lastLoginAt;
    public int $connectionsCount;
    public string $createdAt;
    public string $updatedAt;

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $user = new self();
        $user->id = (string)($data['id'] ?? '');
        $user->email = (string)($data['email'] ?? '');
        $user->firstName = (string)($data['first_name'] ?? '');
        $user->lastName = (string)($data['last_name'] ?? '');
        $user->role = (string)($data['role'] ?? 'Candidate');
        $user->status = (string)($data['status'] ?? 'Active');
        $user->phone = isset($data['phone']) ? (string)$data['phone'] : null;
        $user->avatarUrl = isset($data['avatar_url']) ? (string)$data['avatar_url'] : null;
        $user->headline = isset($data['headline']) ? (string)$data['headline'] : null;
        $user->location = isset($data['location']) ? (string)$data['location'] : null;
        $user->website = isset($data['website']) ? (string)$data['website'] : null;
        $user->bio = isset($data['bio']) ? (string)$data['bio'] : null;
        $user->emailVerifiedAt = isset($data['email_verified_at']) ? (string)$data['email_verified_at'] : null;
        $user->lastLoginAt = isset($data['last_login_at']) ? (string)$data['last_login_at'] : null;
        $user->connectionsCount = (int)($data['connections_count'] ?? 0);
        $user->createdAt = (string)($data['created_at'] ?? date('Y-m-d H:i:s'));
        $user->updatedAt = (string)($data['updated_at'] ?? date('Y-m-d H:i:s'));
        
        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'name' => trim($this->firstName . ' ' . $this->lastName),
            'role' => $this->role,
            'status' => $this->status,
            'phone' => $this->phone,
            'avatar_url' => $this->avatarUrl,
            'profile_image' => $this->avatarUrl, // Alias for compatibility
            'headline' => $this->headline,
            'location' => $this->location,
            'website' => $this->website,
            'bio' => $this->bio,
            'email_verified_at' => $this->emailVerifiedAt,
            'last_login_at' => $this->lastLoginAt,
            'connections_count' => $this->connectionsCount,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
