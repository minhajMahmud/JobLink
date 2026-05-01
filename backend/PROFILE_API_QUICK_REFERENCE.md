# Profile API - Quick Reference

## Endpoints

### 1. Get Profile
```
GET /api/profile
```
**Headers:**
```
x-user-id: {user_id}
x-user-role: {role}
```

### 2. Update Profile
```
PUT /api/profile
```
**Headers:**
```
Content-Type: application/json
x-user-id: {user_id}
x-user-role: {role}
```
**Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+880 1234567890",
  "bio": "...",
  "skills": ["PHP", "MySQL"],
  "experience_years": 5
}
```

### 3. Upload Image
```
POST /api/profile/image
```
**Headers:**
```
Content-Type: multipart/form-data
x-user-id: {user_id}
x-user-role: {role}
```
**Body:**
```
image: [file]
```

---

## Response Format

### Success
```json
{
  "status": true,
  "message": "...",
  "data": {...}
}
```

### Error
```json
{
  "status": false,
  "message": "...",
  "errors": {...}
}
```

---

## Validation Rules

| Field | Type | Max Length | Required |
|-------|------|------------|----------|
| first_name | string | 100 | Yes (if provided) |
| last_name | string | 100 | No |
| phone | string | 30 | No |
| bio | string | 5000 | No |
| website | URL | 255 | No |
| skills | array | - | No |
| experience_years | integer | - | No |

---

## File Upload Limits

- **Max Size**: 2MB
- **Formats**: JPEG, PNG, GIF, WebP
- **Storage**: `storage/avatars/`

---

## Quick Test

```bash
# Get profile
curl "http://localhost:8000/api/profile" \
  -H "x-user-id: USER_ID" \
  -H "x-user-role: Candidate"

# Update profile
curl -X PUT "http://localhost:8000/api/profile" \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID" \
  -H "x-user-role: Candidate" \
  -d '{"first_name":"John","last_name":"Doe"}'

# Upload image
curl -X POST "http://localhost:8000/api/profile/image" \
  -H "x-user-id: USER_ID" \
  -H "x-user-role: Candidate" \
  -F "image=@photo.jpg"
```

---

## Files

- **Documentation**: `PROFILE_API_DOCUMENTATION.md`
- **Implementation**: `PROFILE_SYSTEM_README.md`
- **Test Script**: `test_profile_api.php`

---

## Architecture

```
Request → ProfileController → ProfileService → UserRepository → Database
```

---

## Status Codes

- `200` - Success
- `400` - Validation error
- `401` - Authentication required
- `404` - Profile not found
- `500` - Server error
