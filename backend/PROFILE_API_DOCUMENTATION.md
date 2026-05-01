# User Profile API Documentation

## Overview
Complete user profile system with view and update capabilities, including profile image upload.

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints require authentication. Include headers:
```
Authorization: Bearer {token}
```
OR
```
x-user-id: {user_id}
x-user-role: {role}
```

---

## 1. View Profile API

### GET /api/profile

Get authenticated user's complete profile information.

#### Headers
```
x-user-id: {user_id}
x-user-role: {role}
```

#### Example Request
```bash
GET /api/profile
Host: localhost:8000
x-user-id: 00000000-0000-0000-0000-000000000001
x-user-role: Candidate
```

#### Success Response (200 OK)
```json
{
  "status": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "name": "John Doe",
    "role": "Candidate",
    "status": "Active",
    "phone": "+880 1234567890",
    "avatar_url": "/storage/avatars/abc123.jpg",
    "profile_image": "/storage/avatars/abc123.jpg",
    "headline": "Senior Backend Developer",
    "location": "Dhaka, Bangladesh",
    "website": "https://johndoe.dev",
    "bio": "Experienced backend developer with 6+ years of expertise in PHP, MySQL, and modern web technologies. Passionate about building scalable applications and mentoring junior developers.",
    "email_verified_at": "2026-01-15 10:30:00",
    "last_login_at": "2026-05-01 09:15:00",
    "connections_count": 150,
    "created_at": "2025-12-01 08:00:00",
    "updated_at": "2026-05-01 09:15:00",
    "skills": ["PHP", "MySQL", "Laravel", "Docker", "AWS", "REST API"],
    "experience_years": 6,
    "education_level": "Bachelor",
    "availability_status": "Open to Opportunities",
    "salary_min": 40000,
    "salary_max": 60000,
    "resume_url": "https://example.com/resumes/john-doe.pdf",
    "profile_strength": 85,
    "experience": [
      {
        "id": "exp-001",
        "candidate_id": "cand-001",
        "title": "Senior Backend Developer",
        "company": "TechCorp Bangladesh",
        "start_date": "2022-01-01",
        "end_date": null,
        "is_current": true,
        "description": "Leading backend development team, architecting scalable solutions...",
        "created_at": "2026-01-10 10:00:00",
        "updated_at": "2026-01-10 10:00:00"
      },
      {
        "id": "exp-002",
        "candidate_id": "cand-001",
        "title": "Backend Developer",
        "company": "StartupXYZ",
        "start_date": "2020-03-01",
        "end_date": "2021-12-31",
        "is_current": false,
        "description": "Developed RESTful APIs and database architecture...",
        "created_at": "2026-01-10 10:05:00",
        "updated_at": "2026-01-10 10:05:00"
      }
    ],
    "education": [
      {
        "id": "edu-001",
        "candidate_id": "cand-001",
        "degree": "Bachelor of Science in Computer Science",
        "school": "University of Dhaka",
        "field_of_study": "Computer Science",
        "start_date": "2015-01-01",
        "end_date": "2019-12-31",
        "is_current": false,
        "grade": "3.75/4.00",
        "description": "Focused on software engineering and database systems",
        "created_at": "2026-01-10 10:10:00",
        "updated_at": "2026-01-10 10:10:00"
      }
    ]
  }
}
```

#### Error Response (401 Unauthorized)
```json
{
  "status": false,
  "message": "Authentication required"
}
```

#### Error Response (404 Not Found)
```json
{
  "status": false,
  "message": "Profile not found"
}
```

---

## 2. Update Profile API

### PUT /api/profile

Update authenticated user's profile information.

#### Headers
```
Content-Type: application/json
x-user-id: {user_id}
x-user-role: {role}
```

#### Request Body (JSON)

**Basic Fields (All Users)**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+880 1234567890",
  "bio": "Experienced backend developer...",
  "headline": "Senior Backend Developer",
  "location": "Dhaka, Bangladesh",
  "website": "https://johndoe.dev",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Additional Fields (Candidates Only)**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+880 1234567890",
  "bio": "Experienced backend developer...",
  "headline": "Senior Backend Developer",
  "location": "Dhaka, Bangladesh",
  "website": "https://johndoe.dev",
  "skills": ["PHP", "MySQL", "Laravel", "Docker", "AWS"],
  "experience_years": 6,
  "education_level": "Bachelor",
  "availability_status": "Open to Opportunities",
  "salary_min": 40000,
  "salary_max": 60000,
  "resume_url": "https://example.com/resume.pdf"
}
```

#### Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `first_name` | string | Yes (if provided) | Max 100 characters |
| `last_name` | string | No | Max 100 characters |
| `phone` | string | No | Max 30 characters |
| `bio` | string | No | Max 5000 characters |
| `headline` | string | No | Max 255 characters |
| `location` | string | No | Max 255 characters |
| `website` | string | No | Valid URL |
| `avatar_url` | string | No | Valid URL |
| `skills` | array | No | Array of strings |
| `experience_years` | integer | No | Positive number |
| `education_level` | string | No | One of: High School, Bachelor, Master, PhD |
| `availability_status` | string | No | One of: Available, Actively Looking, Open to Opportunities, Not Available |
| `salary_min` | integer | No | Positive number |
| `salary_max` | integer | No | Positive number, >= salary_min |

#### Example Request
```bash
curl -X PUT http://localhost:8000/api/profile \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: Candidate" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+880 1234567890",
    "bio": "Experienced backend developer with 6+ years...",
    "headline": "Senior Backend Developer",
    "location": "Dhaka, Bangladesh",
    "skills": ["PHP", "MySQL", "Laravel", "Docker"],
    "experience_years": 6,
    "education_level": "Bachelor",
    "availability_status": "Open to Opportunities",
    "salary_min": 40000,
    "salary_max": 60000
  }'
```

#### Success Response (200 OK)
```json
{
  "status": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "name": "John Doe",
    "phone": "+880 1234567890",
    "bio": "Experienced backend developer with 6+ years...",
    "skills": ["PHP", "MySQL", "Laravel", "Docker"],
    ...
  }
}
```

#### Error Response (400 Bad Request - Validation Error)
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": {
    "first_name": "First name is required",
    "website": "Invalid website URL",
    "salary": "Minimum salary cannot be greater than maximum salary"
  }
}
```

---

## 3. Upload Profile Image API

### POST /api/profile/image

Upload a profile image file.

#### Headers
```
Content-Type: multipart/form-data
x-user-id: {user_id}
x-user-role: {role}
```

#### Request Body (multipart/form-data)
```
image: [file upload - JPEG, PNG, GIF, or WebP, max 2MB]
```

#### Validation Rules
- **File type**: JPEG, JPG, PNG, GIF, WebP only
- **File size**: Maximum 2MB
- **Required**: Yes

#### Example Request (cURL)
```bash
curl -X POST http://localhost:8000/api/profile/image \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: Candidate" \
  -F "image=@/path/to/profile-photo.jpg"
```

#### Success Response (200 OK)
```json
{
  "status": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "url": "/storage/avatars/550e8400-e29b-41d4-a716-446655440000.jpg"
  }
}
```

#### Error Responses

**No File Uploaded**
```json
{
  "status": false,
  "message": "No image file uploaded"
}
```

**File Too Large**
```json
{
  "status": false,
  "message": "File size exceeds 2MB limit"
}
```

**Invalid File Type**
```json
{
  "status": false,
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed"
}
```

---

## 4. Alternative: Update Profile with Image

### PUT /api/profile (with file upload)

You can also update profile and upload image in a single request using multipart/form-data.

#### Headers
```
Content-Type: multipart/form-data
x-user-id: {user_id}
x-user-role: {role}
```

#### Request Body (multipart/form-data)
```
first_name: John
last_name: Doe
phone: +880 1234567890
bio: Experienced backend developer...
profile_image: [file upload]
```

#### Example Request
```bash
curl -X PUT http://localhost:8000/api/profile \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: Candidate" \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "phone=+880 1234567890" \
  -F "bio=Experienced backend developer..." \
  -F "profile_image=@/path/to/photo.jpg"
```

---

## Database Schema

### users Table
```sql
CREATE TABLE users (
    id            CHAR(36) PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL DEFAULT '',
    role          ENUM('Candidate','Recruiter','Admin') NOT NULL DEFAULT 'Candidate',
    status        ENUM('Active','Inactive','Suspended') NOT NULL DEFAULT 'Active',
    phone         VARCHAR(30) NULL,
    avatar_url    VARCHAR(500) NULL,
    headline      VARCHAR(255) NULL,
    location      VARCHAR(255) NULL,
    website       VARCHAR(255) NULL,
    bio           TEXT NULL,
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    connections_count INT UNSIGNED DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### candidates Table
```sql
CREATE TABLE candidates (
    id                   CHAR(36) PRIMARY KEY,
    user_id              CHAR(36) NOT NULL UNIQUE,
    skills               JSON NOT NULL DEFAULT ('[]'),
    experience_years     INT NOT NULL DEFAULT 0,
    education_level      ENUM('High School','Bachelor','Master','PhD') DEFAULT 'Bachelor',
    availability_status  ENUM('Available','Actively Looking','Open to Opportunities','Not Available') DEFAULT 'Actively Looking',
    salary_min           INT NULL,
    salary_max           INT NULL,
    resume_url           VARCHAR(500) NULL,
    profile_strength     INT DEFAULT 0,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### candidate_experiences Table
```sql
CREATE TABLE candidate_experiences (
    id           CHAR(36) PRIMARY KEY,
    candidate_id CHAR(36) NOT NULL,
    title        VARCHAR(255) NOT NULL,
    company      VARCHAR(255) NOT NULL,
    start_date   DATE NULL,
    end_date     DATE NULL,
    is_current   BOOLEAN DEFAULT FALSE,
    description  LONGTEXT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);
```

### candidate_education Table
```sql
CREATE TABLE candidate_education (
    id             CHAR(36) PRIMARY KEY,
    candidate_id   CHAR(36) NOT NULL,
    degree         VARCHAR(255) NOT NULL,
    school         VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255) NULL,
    start_date     DATE NULL,
    end_date       DATE NULL,
    is_current     BOOLEAN DEFAULT FALSE,
    grade          VARCHAR(20) NULL,
    description    LONGTEXT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);
```

---

## Architecture

### MVC Pattern
```
Controllers/
  ├── ProfileController.php    # Profile view/update endpoints
  └── UserController.php       # Public user view
Services/
  └── ProfileService.php       # Business logic
Repositories/
  └── UserRepository.php       # Database queries
Models/
  ├── User.php                 # User entity
  ├── CandidateProfile.php     # Candidate profile entity
  ├── Experience.php           # Experience entity
  └── Education.php            # Education entity
```

### Features
- ✅ Secure authentication required
- ✅ Complete profile view
- ✅ Profile update with validation
- ✅ Profile image upload
- ✅ Skills management
- ✅ Experience tracking
- ✅ Education tracking
- ✅ Role-based data (Candidate-specific fields)
- ✅ Clean MVC architecture
- ✅ Proper error handling
- ✅ Input validation
- ✅ File upload handling
- ✅ Database-driven (no mock data)

---

## Testing Examples

### 1. Get Profile
```bash
curl "http://localhost:8000/api/profile" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: Candidate"
```

### 2. Update Profile (JSON)
```bash
curl -X PUT "http://localhost:8000/api/profile" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: Candidate" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+880 1234567890",
    "bio": "Experienced developer",
    "skills": ["PHP", "MySQL", "Laravel"]
  }'
```

### 3. Upload Profile Image
```bash
curl -X POST "http://localhost:8000/api/profile/image" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: Candidate" \
  -F "image=@profile-photo.jpg"
```

### 4. Update Profile with Image
```bash
curl -X PUT "http://localhost:8000/api/profile" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: Candidate" \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "profile_image=@photo.jpg"
```

---

## Setup Instructions

1. **Run Migration**
```bash
cd JobLink/backend
# Migration will be run automatically or manually via SQL
```

2. **Set Permissions**
```bash
chmod 755 storage/avatars
```

3. **Test API**
```bash
# Start backend
cd JobLink/backend
start-backend.bat

# Test endpoint
curl "http://localhost:8000/api/profile" \
  -H "x-user-id: test-user" \
  -H "x-user-role: Candidate"
```

---

## Notes

- All endpoints require authentication
- Profile images are stored in `storage/avatars/`
- Maximum image size: 2MB
- Supported image formats: JPEG, PNG, GIF, WebP
- Email cannot be changed via profile update (security)
- Candidate-specific fields only apply to users with role='Candidate'
- Experience and education are fetched automatically for candidates
- Profile strength is calculated based on completeness

