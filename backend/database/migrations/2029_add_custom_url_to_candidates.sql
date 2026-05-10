-- Add custom_url column to candidates table for customizable profile URLs
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS custom_url VARCHAR(255) NULL UNIQUE AFTER avatar_url;

-- Add index for faster lookup by custom_url
CREATE INDEX IF NOT EXISTS idx_candidates_custom_url ON candidates(custom_url);