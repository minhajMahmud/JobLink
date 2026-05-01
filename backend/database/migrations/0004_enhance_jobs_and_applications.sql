-- Enhancement migration for jobs and applications tables
-- Adds missing columns and indexes for advanced search and filtering

-- Add resume_url column to job_applications if it doesn't exist
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500) NULL AFTER cover_letter;

-- Add resume_file_path column for local file storage
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_file_path VARCHAR(500) NULL AFTER resume_url;

-- Add additional indexes for better search performance (ignore if exists)
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_salary_min ON jobs(salary_min);
CREATE INDEX idx_jobs_salary_max ON jobs(salary_max);
CREATE INDEX idx_jobs_remote_policy ON jobs(remote_policy);
CREATE INDEX idx_jobs_featured ON jobs(featured);

-- Add composite index for common filter combinations
CREATE INDEX idx_jobs_status_published ON jobs(status, published_at);

-- Add index for application lookups
CREATE INDEX idx_applications_candidate ON job_applications(candidate_id);
CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_applied_at ON job_applications(applied_at);
