# API Request/Response Examples

## Complete Working Examples

### 1. Search Jobs - Basic

**Request:**
```http
GET /api/jobs?keyword=developer&page=1&limit=10
Host: localhost:8000
x-user-id: 00000000-0000-0000-0000-000000000001
x-user-role: seeker
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job-001",
      "title": "Senior PHP Developer",
      "company": "TechCorp",
      "location": "Dhaka, Bangladesh",
      "salary": "$40k - $60k",
      "type": "Full-time",
      "experienceLevel": "Senior",
      "skills": ["PHP", "MySQL", "Laravel"],
      "applicants": 15,
      "postedAt": "2 days ago"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### 2. Search Jobs - Advanced Filters

**Request:**
```http
GET /api/jobs?keyword=developer&location=Dhaka&type=Full-time&remote_policy=Remote&min_salary=30000&max_salary=80000&experience_level=Senior&sort=salary_high&page=1&limit=20
Host: localhost:8000
x-user-id: 00000000-0000-0000-0000-000000000001
x-user-role: seeker
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job-002",
      "title": "Senior Backend Developer",
      "company": "RemoteFirst Inc",
      "companyLogo": "https://example.com/logo.png",
      "location": "Dhaka, Bangladesh",
      "remotePolicy": "Remote",
      "salary": "$50k - $80k",
      "salaryMin": 50000,
      "salaryMax": 80000,
      "currency": "USD",
      "type": "Full-time",
      "experienceLevel": "Senior",
      "description": "Looking for experienced backend developer...",
      "requirements": "5+ years PHP, MySQL, REST APIs",
      "benefits": "Health insurance, Remote work, Flexible hours",
      "skills": ["PHP", "MySQL", "Docker", "AWS"],
      "status": "Published",
      "featured": true,
      "applicants": 25,
      "views": 150,
      "postedAt": "1 day ago",
      "postedAtISO": "2026-04-30T10:00:00+00:00"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 3. Get Job Details

**Request:**
```http
GET /api/jobs/job-002
Host: localhost:8000
x-user-id: 00000000-0000-0000-0000-000000000001
x-user-role: seeker
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job-002",
    "title": "Senior Backend Developer",
    "company": "RemoteFirst Inc",
    "companyLogo": "https://example.com/logo.png",
    "location": "Dhaka, Bangladesh",
    "remotePolicy": "Remote",
    "salary": "$50k - $80k",
    "salaryMin": 50000,
    "salaryMax": 80000,
    "currency": "USD",
    "type": "Full-time",
    "experienceLevel": "Senior",
    "description": "We are looking for an experienced backend developer to join our remote team. You will be responsible for building scalable APIs and maintaining our core infrastructure.",
    "requirements": "- 5+ years of PHP development\n- Strong MySQL knowledge\n- Experience with REST APIs\n- Docker and AWS experience\n- Good communication skills",
    "benefits": "- Health insurance\n- Remote work\n- Flexible working hours\n- Annual bonus\n- Learning budget",
    "skills": ["PHP", "MySQL", "Docker", "AWS", "REST API", "Git"],
    "status": "Published",
    "featured": true,
    "applicants": 25,
    "views": 151,
    "postedAt": "1 day ago",
    "postedAtISO": "2026-04-30T10:00:00+00:00",
    "publishedAt": "2026-04-30 10:00:00",
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

### 4. Apply for Job - With Resume URL

**Request:**
```http
POST /api/jobs/job-002/apply
Host: localhost:8000
Content-Type: application/json
x-user-id: 00000000-0000-0000-0000-000000000001
x-user-role: seeker

{
  "cover_letter": "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Backend Developer position at RemoteFirst Inc. With over 6 years of experience in PHP development and a proven track record of building scalable applications, I am confident I would be a valuable addition to your team.\n\nMy expertise includes:\n- Extensive PHP and Laravel development\n- Database design and optimization with MySQL\n- RESTful API development\n- Cloud infrastructure with AWS\n- Containerization with Docker\n\nI am particularly excited about this opportunity because of your company's commitment to remote work and innovation. I believe my skills and experience align perfectly with your requirements.\n\nThank you for considering my application. I look forward to discussing how I can contribute to your team.\n\nBest regards,\nJohn Doe",
  "resume_url": "https://example.com/resumes/john-doe-resume.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application_id": "app-001",
    "job_id": "job-002",
    "status": "Applied",
    "applied_at": "2026-05-01 10:30:00"
  }
}
```

### 5. Apply for Job - With File Upload

**Request:**
```http
POST /api/jobs/job-002/apply
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
x-user-id: 00000000-0000-0000-0000-000000000001
x-user-role: seeker

------WebKitFormBoundary
Content-Disposition: form-data; name="cover_letter"

I am very interested in this position and believe my skills match your requirements perfectly.
------WebKitFormBoundary
Content-Disposition: form-data; name="resume"; filename="resume.pdf"
Content-Type: application/pdf

[Binary PDF content]
------WebKitFormBoundary--
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application_id": "app-002",
    "job_id": "job-002",
    "status": "Applied",
    "applied_at": "2026-05-01 10:35:00"
  }
}
```

### 6. Get My Applications

**Request:**
```http
GET /api/jobs/my-applications
Host: localhost:8000
x-user-id: 00000000-0000-0000-0000-000000000001
x-user-role: seeker
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app-001",
      "job_id": "job-002",
      "candidate_id": "00000000-0000-0000-0000-000000000001",
      "status": "Interview",
      "match_score": 85,
      "cover_letter": "Dear Hiring Manager...",
      "resume_url": "https://example.com/resumes/john-doe-resume.pdf",
      "resume_file_path": null,
      "notes": null,
      "applied_at": "2026-05-01 10:30:00",
      "updated_at": "2026-05-02 14:20:00",
      "job_title": "Senior Backend Developer",
      "job_location": "Dhaka, Bangladesh",
      "company_name": "RemoteFirst Inc",
      "company_logo": "https://example.com/logo.png"
    },
    {
      "id": "app-003",
      "job_id": "job-005",
      "candidate_id": "00000000-0000-0000-0000-000000000001",
      "status": "Applied",
      "match_score": 75,
      "cover_letter": "I am interested in this role...",
      "resume_url": null,
      "resume_file_path": "storage/resumes/abc123.pdf",
      "notes": null,
      "applied_at": "2026-04-28 09:15:00",
      "updated_at": "2026-04-28 09:15:00",
      "job_title": "Full Stack Developer",
      "job_location": "Remote",
      "company_name": "StartupXYZ",
      "company_logo": "https://example.com/startup-logo.png"
    }
  ],
  "meta": {
    "total": 2
  }
}
```

### 7. Get Job Applications (Recruiter)

**Request:**
```http
GET /api/jobs/job-002/applications
Host: localhost:8000
x-user-id: recruiter-001
x-user-role: recruiter
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app-001",
      "job_id": "job-002",
      "candidate_id": "candidate-001",
      "status": "Interview",
      "match_score": 85,
      "cover_letter": "Dear Hiring Manager...",
      "resume_url": "https://example.com/resumes/john-doe-resume.pdf",
      "resume_file_path": null,
      "notes": "Strong candidate, good communication",
      "applied_at": "2026-05-01 10:30:00",
      "updated_at": "2026-05-02 14:20:00",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "avatar_url": "https://example.com/avatars/john.jpg",
      "bio": "Experienced backend developer with 6+ years...",
      "candidate_location": "Dhaka, Bangladesh"
    },
    {
      "id": "app-004",
      "job_id": "job-002",
      "candidate_id": "candidate-002",
      "status": "Applied",
      "match_score": 70,
      "cover_letter": "I am very interested...",
      "resume_url": null,
      "resume_file_path": "storage/resumes/def456.pdf",
      "notes": null,
      "applied_at": "2026-05-01 11:45:00",
      "updated_at": "2026-05-01 11:45:00",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "avatar_url": "https://example.com/avatars/jane.jpg",
      "bio": "Full stack developer passionate about...",
      "candidate_location": "Chittagong, Bangladesh"
    }
  ],
  "meta": {
    "total": 25
  }
}
```

### 8. Update Application Status

**Request:**
```http
PUT /api/jobs/applications/app-001/status
Host: localhost:8000
Content-Type: application/json
x-user-id: recruiter-001
x-user-role: recruiter

{
  "status": "Offer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully"
}
```

## Error Examples

### 1. Validation Error
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

### 2. Already Applied
```json
{
  "success": false,
  "message": "You have already applied to this job"
}
```

### 3. Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 4. Job Not Found
```json
{
  "success": false,
  "message": "Job not found or not available for applications"
}
```

### 5. Invalid Filters
```json
{
  "success": false,
  "message": "Invalid filter parameters",
  "errors": {
    "type": "Invalid job type",
    "min_salary": "Invalid minimum salary",
    "experience_level": "Invalid experience level"
  }
}
```

### 6. File Upload Error
```json
{
  "success": false,
  "message": "File size exceeds 5MB limit"
}
```

### 7. Invalid File Type
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF and DOC/DOCX files are allowed"
}
```

