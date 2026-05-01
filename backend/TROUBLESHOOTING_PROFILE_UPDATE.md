# Profile Update Troubleshooting Guide

## ✅ Backend Status: WORKING

The backend profile update system is **fully functional** and all tests pass successfully.

---

## 🔍 Common Issues & Solutions

### Issue 1: "Authentication Required" Error

**Symptoms:**
```json
{
  "status": false,
  "message": "Authentication required"
}
```

**Solution:**
Make sure you're sending these headers:
```javascript
{
  'x-user-id': 'your-user-uuid-here',
  'x-user-role': 'candidate' // or 'recruiter' or 'admin'
}
```

**Frontend Example:**
```javascript
const response = await fetch('http://localhost:8000/api/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId,        // ← Must be set
    'x-user-role': userRole,    // ← Must be set
  },
  body: JSON.stringify(data),
});
```

---

### Issue 2: "Validation Failed" Error

**Symptoms:**
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": {
    "first_name": "First name is required",
    "website": "Invalid website URL"
  }
}
```

**Solution:**
Check your data against validation rules:
- `first_name`: Cannot be empty
- `website`: Must be valid URL (e.g., `https://example.com`)
- `salary_min`: Must be <= `salary_max`
- `skills`: Must be an array

---

### Issue 3: CORS Error (Frontend)

**Symptoms:**
```
Access to fetch at 'http://localhost:8000/api/profile' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
CORS is already configured on the backend. Make sure:
1. Backend server is running on `http://localhost:8000`
2. You're using the correct URL in your frontend
3. Headers are being sent correctly

---

### Issue 4: 404 Not Found

**Symptoms:**
```json
{
  "error": "Route not found"
}
```

**Solution:**
Check your endpoint URL:
- ✅ Correct: `http://localhost:8000/api/profile`
- ✅ Correct: `http://localhost:8000/api/user/profile`
- ❌ Wrong: `http://localhost:8000/profile`
- ❌ Wrong: `http://localhost:8000/api/profiles`

---

### Issue 5: User Not Found

**Symptoms:**
```json
{
  "status": false,
  "message": "User not found"
}
```

**Solution:**
1. Verify the user ID exists in the database
2. Check you're using the correct UUID format
3. Run this to check:
```bash
php debug_profile_update.php
```

---

### Issue 6: Data Not Persisting

**Symptoms:**
- Update returns success but data doesn't change
- Old data still shows after refresh

**Solution:**
1. Check database connection
2. Verify user has permission to update
3. Run the test script:
```bash
pwsh test_update_simple.ps1
```

---

## 🧪 Testing Tools

### Test 1: Quick API Test (PowerShell)

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-user-id" = "YOUR-USER-ID-HERE"
    "x-user-role" = "candidate"
}

$body = @{
    first_name = "Test"
    last_name = "User"
    bio = "Test bio"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/profile" `
    -Method PUT `
    -Headers $headers `
    -Body $body `
    -UseBasicParsing
```

### Test 2: Using cURL

```bash
curl -X PUT http://localhost:8000/api/profile \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR-USER-ID-HERE" \
  -H "x-user-role: candidate" \
  -d '{"first_name":"Test","last_name":"User"}'
```

### Test 3: Run Automated Test

```bash
# PowerShell
pwsh test_update_simple.ps1

# Or with custom user
pwsh test_update_simple.ps1 -UserId "your-user-id" -UserRole "candidate"
```

---

## 📋 Checklist

Before reporting an issue, verify:

- [ ] Backend server is running (`php -S localhost:8000 -t public`)
- [ ] User ID exists in database
- [ ] Headers are being sent (`x-user-id`, `x-user-role`)
- [ ] Content-Type is `application/json`
- [ ] Request body is valid JSON
- [ ] Endpoint URL is correct (`/api/profile`)
- [ ] HTTP method is `PUT` (not POST or GET)

---

## 🔧 Debug Steps

### Step 1: Check Backend Logs

Look for errors in:
- PHP error log
- Browser console (for CORS errors)
- Network tab (for request/response)

### Step 2: Test with cURL/Postman

If it works with cURL but not from frontend:
- ✅ Backend is working
- ❌ Frontend code has an issue

### Step 3: Check Request in Browser DevTools

Open Network tab and check:
1. Request URL
2. Request Method (should be PUT)
3. Request Headers (x-user-id, x-user-role)
4. Request Payload (JSON data)
5. Response Status Code
6. Response Body

### Step 4: Verify User ID

Run this in MySQL:
```sql
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE id = 'YOUR-USER-ID';
```

---

## 💡 Common Frontend Mistakes

### Mistake 1: Wrong Headers

❌ **Wrong:**
```javascript
headers: {
  'Authorization': 'Bearer token',  // Not used
}
```

✅ **Correct:**
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-user-id': userId,
  'x-user-role': userRole,
}
```

### Mistake 2: Wrong Method

❌ **Wrong:**
```javascript
fetch(url, {
  method: 'POST',  // Should be PUT
  ...
})
```

✅ **Correct:**
```javascript
fetch(url, {
  method: 'PUT',
  ...
})
```

### Mistake 3: Not Sending JSON

❌ **Wrong:**
```javascript
body: data,  // Plain object
```

✅ **Correct:**
```javascript
body: JSON.stringify(data),
```

### Mistake 4: Missing Content-Type

❌ **Wrong:**
```javascript
headers: {
  'x-user-id': userId,
  // Missing Content-Type
}
```

✅ **Correct:**
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-user-id': userId,
  'x-user-role': userRole,
}
```

---

## 📞 Getting Help

If you're still having issues, provide:

1. **Error message** (exact text)
2. **Request details:**
   - URL
   - Method
   - Headers
   - Body
3. **Response details:**
   - Status code
   - Response body
4. **User ID** you're testing with
5. **Browser console errors** (if from frontend)
6. **Network tab screenshot** (if from frontend)

---

## ✅ Verification

Run this to verify everything is working:

```bash
pwsh test_update_simple.ps1
```

Expected output:
```
=== PROFILE UPDATE TEST ===
1. Getting current profile...
   SUCCESS
2. Updating profile...
   SUCCESS
3. Verifying update persisted...
   SUCCESS - Data persisted!
=== TEST COMPLETE ===
```

If you see all SUCCESS messages, the backend is working correctly!

---

## 🎯 Quick Fix Checklist

1. ✅ Backend server running?
2. ✅ Correct endpoint: `/api/profile`?
3. ✅ Method is `PUT`?
4. ✅ Headers include `x-user-id` and `x-user-role`?
5. ✅ Content-Type is `application/json`?
6. ✅ Body is valid JSON?
7. ✅ User ID exists in database?

If all checked, it should work!
