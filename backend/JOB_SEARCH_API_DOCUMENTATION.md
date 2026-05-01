# Job Search, Filter & Application API Documentation

## Overview
Complete backend system for job search, filtering, and job applications with proper database integration.

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints require authentication. Include one of the following in headers:
```
Authorization: Bearer {token}
```
OR
```
x-user-id: {user_id}
x-user-role: {role}
```

---

## 1. Job Search & Filtering API

### GET /api/jobs

Search and filter jobs with advanced options.

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `keyword` | string | No | Search in title, description, company | `developer` |
| `location` | string | No | Filter by location | `Dhaka` |
| `type` | string | No | Job type | `Full-time`, `Part-time`, `Contract`, `Internship` |
| `remote_policy` | string | No | Remote policy | `Onsite`, `Hybrid`, `Remote` |
| `experience_level` | string | No | Experience level | `Entry`, `Junior`, `Mid`, `Senior`, `Lead`, `Executive` |
| `min_salary` | number | No | Minimum salary | `30000` |
| `max_salary` | number | No | Maximum salary | `100000` |
| `featured` | boolean | No | Filter featured jobs | `1` or `true` |
| `sort` | string | No | Sort order | `latest`, `oldest`, `salary_high`, `salary_low`, `relevance` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Results per page (default: 20, max: 100) | `20` |

#### Example Request
```bash
GET /api/jobs?keyword=developer&location=Dhaka&type=Full-time&remote_policy=Remote&min_salary=30000&page=1&limit=20&sort=latest
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Senior Backend Developer",
      "company": "TechCorp Bangladesh",
      "companyLogo": "https://example.com/logo.png",
      "location": "Dhaka, Bangladesh",
      "remotePolicy": "Remote",
      "salary": "$30k - $50k",
      "salaryMin": 30000,
      "salaryMax": 50000,
      "currency": "USD",
      "type": "Full-time",
      "experienceLevel": "Senior",
      "description": "We are looking for an experienced backend developer...",
      "requirements": "5+ years of experience with PHP, MySQL...",
      "benefits": "Health insurance, flexible hours...",
      "skills": ["PHP", "MySQL", "Laravel", "REST API"],
      "status": "Published",
      "featured": true,
      "applicants": 25,
      "views": 150,
      "postedAt": "2 days ago",
      "postedAtISO": "2026-04-29T10:30:00+00:00",
      "publishedAt": "2026-04-29 10:30:00",
      "closedAt": null
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid filter parameters",
  "errors": {
    "type": "Invalid job type",
    "min_salary": "Invalid minimum salary"
  }
}
```

---

## 2. Job Details API

### GET /api/jobs/{id}

Get detailed information about a specific job.

#### Path Parameters
- `id` (string, required): Job ID

#### Example Request
```bash
GET /api/jobs/550e8400-e29b-41d4-a716-446655440000
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Senior Backend Developer",
    "company": "TechCorp Bangladesh",
    "companyLogo": "https://example.com/logo.png",
    "location": "Dhaka, Bangladesh",
    "remotePolicy": "Remote",
    "salary": "$30k - $50k",
    "salaryMin": 30000,
    "salaryMax": 50000,
    "currency": "USD",
    "type": "Full-time",
    "experienceLevel": "Senior",
    "description": "We are looking for an experienced backend developer to join our team...",
    "requirements": "5+ years of experience with PHP, MySQL, and modern frameworks...",
    "benefits": "Health insurance, flexible working hours, remote work options...",
    "skills": ["PHP", "MySQL", "Laravel", "REST API", "Docker"],
    "status": "Published",
    "featured": true,
    "applicants": 25,
    "views": 151,
    "postedAt": "2 days ago",
    "postedAtISO": "2026-04-29T10:30:00+00:00",
    "publishedAt": "2026-04-29 10:30:00",
    "closedAt": null,
    "stats": {
      "applications_count": 25,
      "views_count": 151,
      "total_applications": 25,
      "pending_applications": 15,
      "interview_applications": 8,
      "hired_applications": 2
    }
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Job not found"
}
```

---

## 3. Apply for Job API

### POST /api/jobs/{id}/apply

Submit a job application.

#### Path Parameters
- `id` (string, required): Job ID

#### Request Body (JSON or multipart/form-data)

**Option 1: JSON with resume URL**
```json
{
  "cover_letter": "I am writing to express my interest in the Senior Backend Developer position...",
  "resume_url": "https://example.com/my-resume.pdf"
}
```

**Option 2: Multipart form-data with file upload**
```
Content-Type: multipart/form-data

cover_letter: "I am writing to express my interest..."
resume: [file upload - PDF, DOC, or DOCX, max 5MB]
```

#### Validation Rules
- `resume_url` OR `resume` file: Required (at least one)
- `resume_url`: Must be a valid URL
- `resume` file: PDF, DOC, or DOCX only, max 5MB
- `cover_letter`: Optional, max 5000 characters

#### Example Request (cURL with file upload)
```bash
curl -X POST http://localhost:8000/api/jobs/550e8400-e29b-41d4-a716-446655440000/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cover_letter=I am writing to express my interest..." \
  -F "resume=@/path/to/resume.pdf"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application_id": "660e8400-e29b-41d4-a716-446655440001",
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Applied",
    "applied_at": "2026-05-01 10:30:00"
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**400 Bad Request - Already Applied**
```json
{
  "success": false,
  "message": "You have already applied to this job"
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "resume": "Resume is required",
    "cover_letter": "Cover letter is too long (maximum 5000 characters)"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Job not found or not available for applications"
}
```

---

## 4. My Applications API

### GET /api/jobs/my-applications

Get all job applications submitted by the authenticated user.

#### Example Request
```bash
GET /api/jobs/my-applications
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "job_id": "550e8400-e29b-41d4-a716-446655440000",
      "candidate_id": "770e8400-e29b-41d4-a716-446655440002",
      "status": "Interview",
      "match_score": 85,
      "cover_letter": "I am writing to express my interest...",
      "resume_url": "https://example.com/resume.pdf",
      "resume_file_path": "storage/resumes/abc123.pdf",
      "notes": null,
      "applied_at": "2026-04-28 10:30:00",
      "updated_at": "2026-04-30 14:20:00",
      "job_title": "Senior Backend Developer",
      "job_location": "Dhaka, Bangladesh",
      "company_name": "TechCorp Bangladesh",
      "company_logo": "https://example.com/logo.png"
    }
  ],
  "meta": {
    "total": 5
  }
}
```

---

## 5. Get Job Applications (Recruiter Only)

### GET /api/jobs/{id}/applications

Get all applications for a specific job. Only accessible by recruiters and admins.

#### Path Parameters
- `id` (string, required): Job ID

#### Example Request
```bash
GET /api/jobs/550e8400-e29b-41d4-a716-446655440000/applications
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "job_id": "550e8400-e29b-41d4-a716-446655440000",
      "candidate_id": "770e8400-e29b-41d4-a716-446655440002",
      "status": "Applied",
      "match_score": 85,
      "cover_letter": "I am writing to express my interest...",
      "resume_url": "https://example.com/resume.pdf",
      "resume_file_path": "storage/resumes/abc123.pdf",
      "notes": null,
      "applied_at": "2026-04-28 10:30:00",
      "updated_at": "2026-04-28 10:30:00",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "avatar_url": "https://example.com/avatar.jpg",
      "bio": "Experienced backend developer...",
      "candidate_location": "Dhaka, Bangladesh"
    }
  ],
  "meta": {
    "total": 25
  }
}
```

#### Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 6. Update Application Status (Recruiter Only)

### PUT /api/jobs/applications/{id}/status

Update the status of a job application. Only accessible by recruiters and admins.

#### Path Parameters
- `id` (string, required): Application ID

#### Request Body
```json
{
  "status": "Interview"
}
```

#### Valid Status Values
- `Applied`
- `Reviewed`
- `Interview`
- `Offer`
- `Hired`
- `Rejected`

#### Example Request
```bash
curl -X PUT http://localhost:8000/api/jobs/applications/660e8400-e29b-41d4-a716-446655440001/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Interview"}'
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Application status updated successfully"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Database Schema

### jobs Table
```sql
CREATE TABLE jobs (
    id               CHAR(36) PRIMARY KEY,
    company_id       CHAR(36) NOT NULL,
    recruiter_id     CHAR(36) NOT NULL,
    title            VARCHAR(255) NOT NULL,
    description      LONGTEXT NOT NULL,
    requirements     TEXT NULL,
    benefits         TEXT NULL,
    location         VARCHAR(255) NULL,
    remote_policy    ENUM('Onsite','Hybrid','Remote'),
    job_type         ENUM('Full-time','Part-time','Contract','Internship'),
    experience_level ENUM('Entry','Junior','Mid','Senior','Lead','Executive'),
    salary_min       DECIMAL(12,2) NULL,
    salary_max       DECIMAL(12,2) NULL,
    currency         VARCHAR(3) DEFAULT 'USD',
    required_skills  JSON NOT NULL,
    applications_count INT DEFAULT 0,
    views_count        INT DEFAULT 0,
    status           ENUM('Draft','Published','Closed','Archived'),
    featured         BOOLEAN DEFAULT FALSE,
    published_at     TIMESTAMP NULL,
    closed_at        TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (recruiter_id) REFERENCES users(id)
);
```

### job_applications Table
```sql
CREATE TABLE job_applications (
    id               CHAR(36) PRIMARY KEY,
    job_id           CHAR(36) NOT NULL,
    candidate_id     CHAR(36) NOT NULL,
    status           ENUM('Applied','Reviewed','Interview','Offer','Hired','Rejected'),
    match_score      INT DEFAULT 0,
    cover_letter     TEXT NULL,
    resume_url       VARCHAR(500) NULL,
    resume_file_path VARCHAR(500) NULL,
    notes            TEXT NULL,
    applied_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY (job_id, candidate_id)
);
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific error message"
  }
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Testing Examples

### 1. Search Jobs
```bash
curl "http://localhost:8000/api/jobs?keyword=developer&location=Dhaka&type=Full-time&min_salary=30000&page=1" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: seeker"
```

### 2. Get Job Details
```bash
curl "http://localhost:8000/api/jobs/550e8400-e29b-41d4-a716-446655440000" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: seeker"
```

### 3. Apply for Job (with JSON)
```bash
curl -X POST "http://localhost:8000/api/jobs/550e8400-e29b-41d4-a716-446655440000/apply" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: seeker" \
  -d '{
    "cover_letter": "I am very interested in this position...",
    "resume_url": "https://example.com/my-resume.pdf"
  }'
```

### 4. Apply for Job (with file upload)
```bash
curl -X POST "http://localhost:8000/api/jobs/550e8400-e29b-41d4-a716-446655440000/apply" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: seeker" \
  -F "cover_letter=I am very interested in this position..." \
  -F "resume=@/path/to/resume.pdf"
```

### 5. Get My Applications
```bash
curl "http://localhost:8000/api/jobs/my-applications" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -H "x-user-role: seeker"
```

---

## Architecture

### MVC Pattern
```
Controllers/
  └── JobController.php          # HTTP request handling
Services/
  ├── JobService.php             # Business logic for jobs
  └── JobApplicationService.php  # Business logic for applications
Repositories/
  ├── JobRepository.php          # Database queries for jobs
  └── JobApplicationRepository.php # Database queries for applications
Models/
  ├── Job.php                    # Job entity
  └── JobApplication.php         # Application entity
```

### Features
- ✅ Advanced search with keyword matching
- ✅ Multiple filter options (location, type, salary, etc.)
- ✅ Pagination and sorting
- ✅ Optimized database queries with indexes
- ✅ File upload handling for resumes
- ✅ Duplicate application prevention
- ✅ Role-based access control
- ✅ Input validation
- ✅ Error handling
- ✅ Clean architecture (MVC)
- ✅ Production-ready code

---

## Setup Instructions

1. **Run Migration**
```bash
cd JobLink/backend
php -r "require 'app/Core/Database/Connection.php'; /* migration code */"
```

2. **Set Permissions**
```bash
chmod 755 storage/resumes
```

3. **Test API**
```bash
# Start backend
cd JobLink/backend
start-backend.bat

# Test endpoint
curl "http://localhost:8000/api/jobs" \
  -H "x-user-id: test-user" \
  -H "x-user-role: seeker"
```

---

## Notes

- All endpoints require authentication
- File uploads are stored in `storage/resumes/`
- Maximum resume file size: 5MB
- Supported resume formats: PDF, DOC, DOCX
- Duplicate applications are prevented at database level (UNIQUE constraint)
- Job views are automatically incremented when viewing job details
- Application counts are automatically updated when applying

