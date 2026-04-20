# Backend Scaffold (PHP)

This directory is a modular + layered backend scaffold:

- `app/Modules/*`: domain modules (controller, service, repository, model, routes)
- `app/Core/*`: cross-cutting infrastructure (db, cache, queue, logging)
- `app/Middleware`: request pipeline middleware
- `config/*`: environment-aware configuration
- `database/*`: migrations and seeders
- `storage/*`: logs and cache files

Recommended next step: initialize Composer autoloading and choose a lightweight HTTP kernel/router.

## Resume Upload API

### Endpoint

- `POST /upload-resume.php`

### Purpose

Accepts job seeker resume uploads from the frontend and stores files securely on the server.

### Request

- Content type: `multipart/form-data`
- Fields:
  - `resume` (required): file (`.pdf`, `.doc`, `.docx`)
  - `user_id` (optional): authenticated user identifier

### Validation rules

- Allowed extensions: `pdf`, `doc`, `docx`
- Allowed MIME types:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Max size: `2MB`
- Executable/script extensions are blocked (`php`, `exe`, `sh`, etc.)
- File names are sanitized and uniquely renamed (`timestamp + random bytes`)

### Storage strategy

- Files are stored in: `backend/storage/resumes/`
- This is outside public web root (`backend/public`), reducing direct exposure risk.

### Success response

```json
{
  "success": true,
  "message": "Resume uploaded successfully.",
  "data": {
    "file_name": "20260420_120000_abcd1234_resume.pdf",
    "file_path": "storage/resumes/20260420_120000_abcd1234_resume.pdf",
    "mime_type": "application/pdf",
    "size": 123456,
    "upload_date": "2026-04-20T12:00:00+00:00",
    "user_id": "seeker-1",
    "db_saved": true
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "Invalid format. Only PDF, DOC, and DOCX are allowed."
}
```

### Optional DB persistence

If MySQL environment variables are available, uploads are also logged in table `user_resumes` with:

- `user_id`
- `file_path`
- `upload_date`

These records help track candidate uploads for recruiter and admin workflows.
Use this for audit history and profile completeness checks.

<!-- End of resume upload API documentation -->

