-- Recruitment Management System Database Schema
-- Core tables for candidates, interviews, jobs, promotions, and posts

-- Candidates Table (extends users)
CREATE TABLE candidates (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,
    skills JSON NOT NULL DEFAULT '[]', -- Array of skill strings
    experience_years INT NOT NULL DEFAULT 0,
    education_level ENUM('High School', 'Bachelor', 'Master', 'PhD') NOT NULL DEFAULT 'Bachelor',
    location VARCHAR(255) NOT NULL,
    availability_status ENUM('Available', 'Actively Looking', 'Open to Opportunities', 'Not Available') NOT NULL DEFAULT 'Actively Looking',
    salary_expectation_min INT,
    salary_expectation_max INT,
    bio TEXT,
    avatar_url VARCHAR(500),
    profile_strength INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_skills (skills),
    INDEX idx_experience (experience_years),
    INDEX idx_availability (availability_status),
    INDEX idx_location (location),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_bio (bio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interview Scheduling Table
CREATE TABLE interviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    job_id CHAR(36) NOT NULL,
    recruiter_id CHAR(36) NOT NULL,
    type ENUM('Virtual', 'In-Person', 'Phone', 'Technical') NOT NULL,
    round ENUM('Screening', 'Technical', 'HR', 'Final') NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    timezone VARCHAR(50),
    location VARCHAR(255),
    meet_link VARCHAR(500),
    agenda TEXT,
    notes TEXT,
    status ENUM('Scheduled', 'Completed', 'Rescheduled', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_recruiter_id (recruiter_id),
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_status (status),
    UNIQUE KEY uq_no_overlap (recruiter_id, scheduled_at, duration_minutes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Promotions Table
CREATE TABLE job_promotions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    job_id CHAR(36) NOT NULL,
    recruiter_id CHAR(36) NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days IN (7, 15, 30)),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    price DECIMAL(10, 2),
    payment_status ENUM('Pending', 'Paid', 'Refunded') DEFAULT 'Pending',
    status ENUM('Pending', 'Active', 'Expired', 'Cancelled') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_is_active (is_active),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Company Posts Table (Engagement Feed)
CREATE TABLE company_posts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recruiter_id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    content LONGTEXT NOT NULL,
    engagement_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_recruiter_id (recruiter_id),
    INDEX idx_company_id (company_id),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post Media Table
CREATE TABLE post_media (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    type ENUM('Image', 'Video', 'Link') NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES company_posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post Engagements Table (Likes, Comments, Shares)
CREATE TABLE post_engagements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    type ENUM('Like', 'Comment', 'Share') NOT NULL,
    content LONGTEXT, -- For comments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES company_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    UNIQUE KEY uq_like_per_post (post_id, user_id, type) -- Prevent duplicate likes
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved Candidate Searches (Filter Presets)
CREATE TABLE saved_candidate_searches (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recruiter_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    filters JSON NOT NULL, -- Stored as JSON for flexibility
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recruiter_id (recruiter_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recruiter Availability Table (For interview scheduling)
CREATE TABLE recruiter_availability (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recruiter_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recruiter_id (recruiter_id),
    INDEX idx_date (date),
    UNIQUE KEY uq_recruiter_slot (recruiter_id, date, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Promotion Analytics Table
CREATE TABLE promotion_analytics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    promotion_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    applications INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES job_promotions(id) ON DELETE CASCADE,
    INDEX idx_promotion_id (promotion_id),
    INDEX idx_date (date),
    UNIQUE KEY uq_daily_stats (promotion_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure users and companies tables exist (if not already)
-- These should already exist but adding for reference:
-- CREATE TABLE users (
--     id CHAR(36) PRIMARY KEY,
--     email VARCHAR(255) UNIQUE,
--     password VARCHAR(255),
--     role ENUM('Candidate', 'Recruiter', 'Admin'),
--     ...
-- );
-- CREATE TABLE companies (
--     id CHAR(36) PRIMARY KEY,
--     name VARCHAR(255),
--     ...
-- );
-- CREATE TABLE jobs (
--     id CHAR(36) PRIMARY KEY,
--     ...
-- );

-- Create indexes for performance optimization
ALTER TABLE candidates ADD FULLTEXT INDEX ft_search (bio) IF NOT EXISTS;
ALTER TABLE company_posts ADD INDEX idx_likes_count (likes_count);
ALTER TABLE interviews ADD INDEX idx_round (round);
ALTER TABLE job_promotions ADD INDEX idx_promotion_status (status);
