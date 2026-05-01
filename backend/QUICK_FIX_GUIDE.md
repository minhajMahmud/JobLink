# Quick Fix Guide - Posts Not Saving

## The Problem
Posts show in frontend but don't save to database.

## Most Likely Cause
The backend API is either:
1. Not receiving the request
2. Receiving the request but failing silently
3. Returning an error that the frontend ignores

## Quick Diagnostic Steps

### Step 1: Is Backend Running?
```bash
cd JobLink/backend
start-backend.bat
```

Leave this terminal open. You should see:
```
Server: http://localhost:8000
```

### Step 2: Clear Debug Log
Open a NEW terminal:
```bash
cd JobLink/backend
echo. > debug_requests.log
```

### Step 3: Try Creating a Post

1. Open your frontend in browser
2. Open Browser DevTools (Press F12)
3. Go to **Network** tab
4. Create a post in the feed
5. Look for a request to `/api/feed/posts`

### Step 4: Check What Happened

#### In Browser Network Tab:
- **If you see the request**: Click on it and check:
  - Status code (should be 200)
  - Response tab (what did the server return?)
  - Headers tab (was authentication sent?)

- **If you DON'T see the request**: The frontend isn't sending it at all
  - Check Console tab for JavaScript errors
  - Check if `VITE_API_URL` is set correctly

#### In Backend Debug Log:
```bash
cd JobLink/backend
type debug_requests.log
```

**What you should see if it's working:**
```
[2026-05-01 12:34:56] createPost called
  User ID: 00000000-0000-0000-0000-000000000001
  Request data: {"content":"My post",...}
  Database connection: OK
  Post inserted with ID: abc123...
  Post fetched: YES
  SUCCESS: Post created
```

**If log is empty**: Backend never received the request
**If log shows error**: Read the error message

### Step 5: Check Database
```bash
cd JobLink/backend
php -r "if (file_exists('.env')) { $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES); foreach ($lines as $line) { if (strpos(trim($line), '#') === 0) continue; if (strpos($line, '=') === false) continue; list($k, $v) = explode('=', $line, 2); putenv(trim($k) . '=' . trim($v)); } } require 'app/Core/Database/Connection.php'; $pdo = App\Core\Database\Connection::getPdo(); $stmt = $pdo->query('SELECT COUNT(*) FROM posts'); echo 'Total posts in database: ' . $stmt->fetchColumn() . PHP_EOL; $stmt = $pdo->query('SELECT id, LEFT(content, 50) as content, created_at FROM posts ORDER BY created_at DESC LIMIT 3'); echo PHP_EOL . 'Recent posts:' . PHP_EOL; while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) { echo '  - ' . $row['content'] . '... (' . $row['created_at'] . ')' . PHP_EOL; }"
```

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptom**: Browser shows "Network Error" or "ERR_CONNECTION_REFUSED"

**Solution**:
```bash
cd JobLink/backend
start-backend.bat
```

### Issue 2: Wrong API URL
**Symptom**: Request goes to wrong URL (not localhost:8000)

**Solution**: Check frontend API configuration
- Look for `.env` file in JobLink root
- Should have: `VITE_API_URL=http://localhost:8000/api`
- If missing, create it

### Issue 3: CORS Error
**Symptom**: Browser console shows CORS policy error

**Solution**: Backend should handle this automatically. If not, check `public/index.php` has CORS headers.

### Issue 4: Authentication Failed
**Symptom**: Debug log shows "Unauthorized"

**Solution**: 
- Make sure you're logged in
- Check if `APP_ENV=local` in backend `.env` (enables auto-auth)
- Check if frontend is sending auth headers

### Issue 5: Database Error
**Symptom**: Debug log shows "Database unavailable"

**Solution**:
```bash
cd JobLink/backend
php check_posts_schema.php
```

Should show all columns including `scheduled_for`.

## Manual Test (Bypass Frontend)

If you want to test the backend directly without the frontend:

### Option A: Using PowerShell (Windows)
```powershell
$body = @{
    content = "Test post from PowerShell"
    visibility = "public"
    hashtags = @("#test")
    attachments = @()
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-user-id" = "00000000-0000-0000-0000-000000000001"
    "x-user-role" = "admin"
}

Invoke-WebRequest -Uri "http://localhost:8000/api/feed/posts" -Method POST -Body $body -Headers $headers
```

### Option B: Using Browser Console
Open browser console (F12) and paste:

```javascript
fetch('http://localhost:8000/api/feed/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': '00000000-0000-0000-0000-000000000001',
    'x-user-role': 'admin'
  },
  body: JSON.stringify({
    content: 'Test post from browser console',
    visibility: 'public',
    hashtags: ['#test'],
    attachments: []
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

If this works, the backend is fine and the issue is in the frontend.

## What to Check in Frontend

If backend is working but posts still don't save, check:

### 1. Frontend API File
File: `JobLink/Frontend/src/features/feed/api/feedApi.ts`

Make sure `createPost` function is:
- Sending correct data format
- Using correct headers
- Handling response correctly

### 2. Frontend Feed Page
File: `JobLink/Frontend/src/pages/FeedPage.tsx`

Check `handleNewPost` function:
- Is it calling `apiCreatePost`?
- Is it handling errors?
- Is it updating state correctly?

### 3. Check for Silent Failures
Add console.log to see what's happening:

In `FeedPage.tsx`, find `handleNewPost` and add:
```typescript
try {
  console.log('Calling API with:', payload);
  const res = await apiCreatePost({...});
  console.log('API response:', res);
  
  if (res.success && res.data) {
    console.log('Success! Updating state...');
    setPosts((prev) =>
      prev.map((p) => (p.id === optimisticPost.id ? res.data! : p))
    );
  } else {
    console.error('API returned failure:', res.message);
  }
} catch (error) {
  console.error('API call failed:', error);
}
```

## Summary Checklist

- [ ] Backend server is running on localhost:8000
- [ ] Debug log shows requests are being received
- [ ] Database has all required columns (run `check_posts_schema.php`)
- [ ] Browser Network tab shows POST request to `/api/feed/posts`
- [ ] Response status is 200 OK
- [ ] Response body shows `success: true`
- [ ] Posts appear in database (check with SQL query)

If ALL of these are true but posts still don't show in frontend after refresh, the issue is in how the frontend fetches and displays posts.

## Need More Help?

Run this diagnostic and share the output:

```bash
cd JobLink/backend
echo "=== Backend Status ===" && \
php -v && \
echo "" && \
echo "=== Database Status ===" && \
php check_posts_schema.php && \
echo "" && \
echo "=== Recent Debug Log ===" && \
type debug_requests.log && \
echo "" && \
echo "=== Post Count ===" && \
php -r "if (file_exists('.env')) { $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES); foreach ($lines as $line) { if (strpos(trim($line), '#') === 0) continue; if (strpos($line, '=') === false) continue; list($k, $v) = explode('=', $line, 2); putenv(trim($k) . '=' . trim($v)); } } require 'app/Core/Database/Connection.php'; $pdo = App\Core\Database\Connection::getPdo(); echo $pdo->query('SELECT COUNT(*) FROM posts')->fetchColumn() . ' posts in database' . PHP_EOL;"
```

Also share:
- Screenshot of Browser Network tab showing the POST request
- Screenshot of Browser Console showing any errors
- The response body from the POST request
