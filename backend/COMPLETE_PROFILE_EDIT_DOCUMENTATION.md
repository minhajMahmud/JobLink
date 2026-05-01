# Complete Profile Edit System Documentation

## ✅ System Status: FULLY IMPLEMENTED & TESTED

The complete "Edit Full Profile" system is **production-ready** and fully functional. All requirements have been implemented with clean MVC architecture, comprehensive validation, and database persistence.

---

## 📋 Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Supported Fields](#supported-fields)
3. [Request/Response Examples](#requestresponse-examples)
4. [Validation Rules](#validation-rules)
5. [Database Schema](#database-schema)
6. [Architecture](#architecture)
7. [File Upload](#file-upload)
8. [Testing](#testing)

---

## 🔌 API Endpoints

### Primary Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/profile` | Get authenticated user's complete profile | ✅ Yes |
| `PUT` | `/api/profile` | Update user profile (full or partial) | ✅ Yes |
| `POST` | `/api/profile/image` | Upload profile image | ✅ Yes |

### Alternative Endpoints (Same Functionality)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/user/profile` | Get authenticated user's profile | ✅ Yes |
| `PUT` | `/api/user/profile` | Update user profile | ✅ Yes |
| `POST` | `/api/user/profile/image` | Upload profile image | ✅ Yes |

---

## 📝 Supported Fields

### Basic User Fields (All Users)

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `first_name` | string | ✅ Yes | 100 | User's first name |
| `last_name` | string | ❌ No | 100 | User's last name |
| `phone` | string | ❌ No | 30 | Phone number |
| `bio` | text | ❌ No | 5000 | User biography |
| `headline` | string | ❌ No | 255 | Professional headline |
| `location` | string | ❌ No | 255 | City, State/Country |
| `website` | string (URL) | ❌ No | 255 | Personal website URL |
| `avatar_url` | string (URL) | ❌ No | 255 | Profile image URL |

### Candidate-Specific Fields (Candidates Only)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `skills` | array | ❌ No | Must be array | List of skills (e.g., ["PHP", "React"]) |
| `experience_years` | integer | ❌ No | >= 0 | Years of professional experience |
| `education_level` | string | ❌ No | Enum | One of: "High School", "Bachelor", "Master", "PhD" |
| `availability_status` | string | ❌ No | - | Current availability status |
| `salary_min` | integer | ❌ No | >= 0 | Minimum salary expectation |
| `salary_max` | integer | ❌ No | >= 0, >= salary_min | Maximum salary expectation |
| `resume_url` | string (URL) | ❌ No | - | Resume file URL |

---

## 📤 Request/Response Examples

### Example 1: Full Profile Update

**Request:**
```http
PUT /api/profile HTTP/1.1
Host: localhost:8000
Content-Type: application/json
x-user-id: 00000000-0000-0000-0000-000000000003
x-user-role: candidate

{
  "first_name": "Sarah",
  "last_name": "Williams",
  "phone": "+1-555-7890",
  "bio": "Experienced software engineer passionate about building scalable applications",
  "headline": "Senior Software Engineer | Full-Stack Developer",
  "location": "San Francisco, CA",
  "website": "https://sarahwilliams.dev",
  "skills": ["PHP", "JavaScript", "React", "Node.js", "MySQL", "Docker", "AWS"],
  "experience_years": 6,
  "education_level": "Master",
  "availability_status": "Open to opportunities",
  "salary_min": 85000,
  "salary_max": 120000
}
```

**Response:**
```json
{
  "status": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "00000000-0000-0000-0000-000000000003",
    "email": "candidate@joblink.com",
    "first_name": "Sarah",
    "last_name": "Williams",
    "name": "Sarah Williams",
    "role": "Candidate",
    "status": "Active",
    "phone": "+1-555-7890",
    "avatar_url": null,
    "profile_image": null,
    "headline": "Senior Software Engineer | Full-Stack Developer",
    "location": "San Francisco, CA",
    "website": "https://sarahwilliams.dev",
    "bio": "Experienced software engineer passionate about building scalable applications",
    "skills": ["PHP", "JavaScript", "React", "Node.js", "MySQL", "Docker", "AWS"],
    "experience_years": 6,
    "education_level": "Master",
    "availability_status": "Open to Opportunities",
    "salary_min": 85000,
    "salary_max": 120000,
    "experience": [],
    "education": [],
    "created_at": "2026-04-30 19:03:27",
    "updated_at": "2026-05-01 06:30:15"
  }
}
```

### Example 2: Partial Update (Only Bio and Phone)

**Request:**
```http
PUT /api/profile HTTP/1.1
Host: localhost:8000
Content-Type: application/json
x-user-id: 00000000-0000-0000-0000-000000000003
x-user-role: candidate

{
  "bio": "Updated biography text",
  "phone": "+1-555-9999"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "00000000-0000-0000-0000-000000000003",
    "first_name": "Sarah",
    "last_name": "Williams",
    "bio": "Updated biography text",
    "phone": "+1-555-9999",
    ...
  }
}
```

### Example 3: Get Profile

**Request:**
```http
GET /api/profile HTTP/1.1
Host: localhost:8000
x-user-id: 00000000-0000-0000-0000-000000000003
x-user-role: candidate
```

**Response:**
```json
{
  "status": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "00000000-0000-0000-0000-000000000003",
    "email": "candidate@joblink.com",
    "first_name": "Sarah",
    "last_name": "Williams",
    ...
  }
}
```

### Example 4: Validation Error

**Request:**
```http
PUT /api/profile HTTP/1.1
Content-Type: application/json

{
  "first_name": "",
  "website": "not-a-valid-url",
  "salary_min": 150000,
  "salary_max": 100000
}
```

**Response:**
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

## 🛡️ Validation Rules

### Field Validations

| Field | Validation Rules |
|-------|------------------|
| `first_name` | Required if provided, max 100 characters |
| `last_name` | Max 100 characters |
| `phone` | Max 30 characters |
| `bio` | Max 5000 characters |
| `website` | Must be valid URL format |
| `avatar_url` | Must be valid URL format |
| `skills` | Must be an array |
| `experience_years` | Must be numeric and >= 0 |
| `education_level` | Must be one of: "High School", "Bachelor", "Master", "PhD" |
| `salary_min` | Must be numeric and >= 0 |
| `salary_max` | Must be numeric and >= 0 |
| `salary_min` & `salary_max` | salary_min must be <= salary_max |

### Profile Image Upload Validations

| Rule | Value |
|------|-------|
| Max file size | 2 MB |
| Allowed types | JPEG, JPG, PNG, GIF, WebP |
| Storage location | `/storage/avatars/` |

---

## 🗄️ Database Schema

### `users` Table

```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    role ENUM('Candidate', 'Recruiter', 'Admin') DEFAULT 'Candidate',
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    phone VARCHAR(30),
    avatar_url VARCHAR(255),
    headline VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    bio TEXT,
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    connections_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `candidates` Table

```sql
CREATE TABLE candidates (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    skills JSON,
    experience_years INT DEFAULT 0,
    education_level ENUM('High School', 'Bachelor', 'Master', 'PhD') DEFAULT 'Bachelor',
    availability_status VARCHAR(50),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    resume_url VARCHAR(255),
    profile_strength INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `candidate_experiences` Table

```sql
CREATE TABLE candidate_experiences (
    id CHAR(36) PRIMARY KEY,
    candidate_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);
```

### `candidate_education` Table

```sql
CREATE TABLE candidate_education (
    id CHAR(36) PRIMARY KEY,
    candidate_id CHAR(36) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    grade VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);
```

---

## 🏗️ Architecture

### MVC Structure

```
JobLink/backend/
├── app/
│   └── Modules/
│       └── User/
│           ├── Controllers/
│           │   └── ProfileController.php      # HTTP request handling
│           ├── Services/
│           │   └── ProfileService.php         # Business logic & validation
│           ├── Repositories/
│           │   └── UserRepository.php         # Database operations
│           ├── Models/
│           │   ├── User.php                   # User model
│           │   ├── CandidateProfile.php       # Candidate profile model
│           │   ├── Experience.php             # Experience model
│           │   └── Education.php              # Education model
│           └── Routes/
│               ├── api.php                    # /api/user/* routes
│               └── profile.php                # /api/profile routes
├── routes/
│   └── api.php                                # Main route registry
└── public/
    └── index.php                              # Application entry point
```

### Component Responsibilities

#### **ProfileController** (`Controllers/ProfileController.php`)
- Handles HTTP requests
- Authenticates users
- Delegates to ProfileService
- Returns JSON responses

#### **ProfileService** (`Services/ProfileService.php`)
- Business logic
- Data validation
- File upload handling
- Coordinates between controller and repository

#### **UserRepository** (`Repositories/UserRepository.php`)
- Database operations (CRUD)
- Query execution
- Data persistence
- Handles both `users` and `candidates` tables

#### **Models** (`Models/*.php`)
- Data structures
- Type safety
- Array conversion methods

---

## 📁 File Upload

### Profile Image Upload

**Endpoint:** `POST /api/profile/image`

**Request:**
```http
POST /api/profile/image HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data
x-user-id: 00000000-0000-0000-0000-000000000003
x-user-role: candidate

------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="profile.jpg"
Content-Type: image/jpeg

[binary image data]
------WebKitFormBoundary--
```

**Response:**
```json
{
  "status": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "url": "/storage/avatars/550e8400-e29b-41d4-a716-446655440000.jpg"
  }
}
```

### Upload Specifications

- **Max Size:** 2 MB
- **Allowed Types:** JPEG, JPG, PNG, GIF, WebP
- **Storage:** `/storage/avatars/`
- **Filename:** UUID-based (e.g., `550e8400-e29b-41d4-a716-446655440000.jpg`)
- **Validation:** MIME type checking via `finfo_file()`

---

## 🧪 Testing

### Manual Testing

Run the comprehensive test script:

```bash
php test_full_profile_edit.php
```

Or use PowerShell:

```powershell
./test_full_profile_edit.ps1
```

### cURL Examples

**Get Profile:**
```bash
curl -X GET http://localhost:8000/api/profile \
  -H "x-user-id: 00000000-0000-0000-0000-000000000003" \
  -H "x-user-role: candidate"
```

**Update Profile:**
```bash
curl -X PUT http://localhost:8000/api/profile \
  -H "Content-Type: application/json" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000003" \
  -H "x-user-role: candidate" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Software engineer",
    "skills": ["PHP", "JavaScript"]
  }'
```

**Upload Image:**
```bash
curl -X POST http://localhost:8000/api/profile/image \
  -H "x-user-id: 00000000-0000-0000-0000-000000000003" \
  -H "x-user-role: candidate" \
  -F "image=@/path/to/profile.jpg"
```

### Test Results

✅ **All tests passing:**
- ✓ Get profile
- ✓ Full profile update (all fields)
- ✓ Partial profile update (specific fields)
- ✓ Candidate-specific fields (skills, experience, education)
- ✓ Validation (empty name, invalid URL, invalid salary range)
- ✓ Database persistence
- ✓ Alternative endpoints
- ✓ File upload

---

## ✨ Features

### ✅ Implemented Features

- [x] Full profile update with all fields
- [x] Partial updates (only specified fields)
- [x] Comprehensive field validation
- [x] Database persistence (users + candidates tables)
- [x] JSON field handling (skills array)
- [x] File upload support (profile images)
- [x] Authentication required (x-user-id, x-user-role headers)
- [x] Clean MVC architecture
- [x] Production-ready code
- [x] Proper error handling
- [x] Role-based fields (candidate-specific)
- [x] Multiple endpoint support (/api/profile and /api/user/profile)
- [x] Image validation (type, size)
- [x] URL validation
- [x] Salary range validation
- [x] Auto-create candidate profile if missing

---

## 🚀 Usage in Frontend

### React/JavaScript Example

```javascript
// Get profile
const getProfile = async () => {
  const response = await fetch('http://localhost:8000/api/profile', {
    method: 'GET',
    headers: {
      'x-user-id': userId,
      'x-user-role': userRole,
    },
  });
  const data = await response.json();
  return data;
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await fetch('http://localhost:8000/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  return data;
};

// Upload profile image
const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('http://localhost:8000/api/profile/image', {
    method: 'POST',
    headers: {
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: formData,
  });
  const data = await response.json();
  return data;
};
```

---

## 📊 Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| API Endpoints | ✅ Complete | Both /api/profile and /api/user/profile working |
| Database Schema | ✅ Complete | All tables and columns exist |
| Validation | ✅ Complete | Comprehensive validation implemented |
| File Upload | ✅ Complete | Image upload with validation |
| Authentication | ✅ Complete | Header-based auth working |
| MVC Architecture | ✅ Complete | Clean separation of concerns |
| Testing | ✅ Complete | All tests passing |
| Documentation | ✅ Complete | This document |

---

## 🎯 Conclusion

The **Complete Profile Edit System** is **fully implemented, tested, and production-ready**. All requirements have been met:

✅ Update all profile fields dynamically  
✅ Database persistence  
✅ Comprehensive validation  
✅ File upload support  
✅ Authentication required  
✅ Clean MVC architecture  
✅ Production-ready code  
✅ Proper error handling  

The system is ready for integration with your React frontend!
