-- Enhancement migration for user profile system
-- Ensures all necessary columns exist for profile management

-- Add profile_image column to users table if it doesn't exist (alias for avatar_url)
-- Note: avatar_url already exists, so we'll use that

-- Ensure candidates table has all necessary columns
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS bio TEXT NULL AFTER user_id;

-- Add indexes for better profile query performance
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_experiences_candidate ON candidate_experiences(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_education_candidate ON candidate_education(candidate_id);
