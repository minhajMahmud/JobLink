-- ============================================================
-- JobLink Master Schema
-- Run this file once on a fresh `joblink` database.
-- It drops all tables in safe order then recreates everything.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- drop in reverse-dependency order
DROP TABLE IF EXISTS promotion_analytics;
DROP TABLE IF EXISTS post_engagements;
DROP TABLE IF EXISTS post_media;
DROP TABLE IF EXISTS post_reactions;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS company_posts;
DROP TABLE IF EXISTS saved_candidate_searches;
DROP TABLE IF EXISTS recruiter_availability;
DROP TABLE IF EXISTS job_promotions;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS candidate_resumes;
DROP TABLE IF EXISTS candidate_certifications;
DROP TABLE IF EXISTS candidate_skill_endorsements;
DROP TABLE IF EXISTS candidate_publications;
DROP TABLE IF EXISTS candidate_projects;
DROP TABLE IF EXISTS candidate_education;
DROP TABLE IF EXISTS candidate_experiences;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS recruiter_company;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS user_connections;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS admin_audit_logs;
DROP TABLE IF EXISTS spam_events;
DROP TABLE IF EXISTS admin_reports;
DROP TABLE IF EXISTS moderation_jobs;
DROP TABLE IF EXISTS moderation_posts;
DROP TABLE IF EXISTS admin_user_roles;
DROP TABLE IF EXISTS admin_role_permissions;
DROP TABLE IF EXISTS admin_permissions;
DROP TABLE IF EXISTS admin_roles;
DROP TABLE IF EXISTS employer_profiles;
DROP TABLE IF EXISTS admin_profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. USERS  (central account table for ALL roles)
-- ============================================================
CREATE TABLE users (
    id            CHAR(36)     PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL DEFAULT '',
    role          ENUM('Candidate','Recruiter','Admin') NOT NULL DEFAULT 'Candidate',
    status        ENUM('Active','Inactive','Suspended')  NOT NULL DEFAULT 'Active',
    phone         VARCHAR(30)  NULL,
    avatar_url    VARCHAR(500) NULL,
    headline      VARCHAR(255) NULL,
    location      VARCHAR(255) NULL,
    website       VARCHAR(255) NULL,
    bio           TEXT         NULL,
    email_verified_at TIMESTAMP NULL,
    last_login_at     TIMESTAMP NULL,
    connections_count INT UNSIGNED DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role   (role),
    INDEX idx_status (status),
    INDEX idx_email  (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ADMIN PROFILES  (extra data for Admin role)
-- ============================================================
CREATE TABLE admin_profiles (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id      CHAR(36) NOT NULL UNIQUE,
    access_level ENUM('Super','Manager','Support') NOT NULL DEFAULT 'Support',
    department   VARCHAR(100) NULL,
    notes        TEXT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. EMPLOYER / RECRUITER PROFILES
-- ============================================================
CREATE TABLE employer_profiles (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id         CHAR(36) NOT NULL UNIQUE,
    company_name    VARCHAR(255) NOT NULL,
    company_size    ENUM('1-10','11-50','51-200','201-500','500+') DEFAULT '11-50',
    industry        VARCHAR(100) NULL,
    company_website VARCHAR(255) NULL,
    company_logo    VARCHAR(500) NULL,
    company_desc    TEXT NULL,
    headquarters    VARCHAR(255) NULL,
    founded_year    YEAR NULL,
    linkedin        VARCHAR(255) NULL,
    twitter         VARCHAR(255) NULL,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. CANDIDATE PROFILES  (extra data for Candidate role)
-- ============================================================
CREATE TABLE candidates (
    id                   CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id              CHAR(36) NOT NULL UNIQUE,
    skills               JSON     NOT NULL DEFAULT ('[]'),
    experience_years     INT      NOT NULL DEFAULT 0,
    education_level      ENUM('High School','Bachelor','Master','PhD') DEFAULT 'Bachelor',
    availability_status  ENUM('Available','Actively Looking','Open to Opportunities','Not Available') DEFAULT 'Actively Looking',
    salary_min           INT NULL,
    salary_max           INT NULL,
    resume_url           VARCHAR(500) NULL,
    profile_strength     INT DEFAULT 0,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_availability (availability_status),
    INDEX idx_experience   (experience_years)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. CANDIDATE DETAIL TABLES
-- ============================================================
CREATE TABLE candidate_experiences (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    title        VARCHAR(255) NOT NULL,
    company      VARCHAR(255) NOT NULL,
    start_date   DATE NULL,
    end_date     DATE NULL,
    is_current   BOOLEAN DEFAULT FALSE,
    description  LONGTEXT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_education (
    id             CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id   CHAR(36) NOT NULL,
    degree         VARCHAR(255) NOT NULL,
    school         VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255) NULL,
    start_date     DATE NULL,
    end_date       DATE NULL,
    is_current     BOOLEAN DEFAULT FALSE,
    grade          VARCHAR(20) NULL,
    description    LONGTEXT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_projects (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  LONGTEXT NOT NULL,
    link         VARCHAR(500) NULL,
    start_date   DATE NULL,
    end_date     DATE NULL,
    is_current   BOOLEAN DEFAULT FALSE,
    technologies JSON NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_certifications (
    id             CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id   CHAR(36) NOT NULL,
    name           VARCHAR(255) NOT NULL,
    issuer         VARCHAR(255) NULL,
    issue_date     DATE NULL,
    expiry_date    DATE NULL,
    credential_id  VARCHAR(255) NULL,
    credential_url VARCHAR(500) NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_skill_endorsements (
    id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id     CHAR(36) NOT NULL,
    skill_name       VARCHAR(255) NOT NULL,
    endorsement_count INT DEFAULT 0,
    top_endorsers    JSON NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY uq_candidate_skill (candidate_id, skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_resumes (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id      CHAR(36) NOT NULL UNIQUE,
    theme        VARCHAR(50) DEFAULT 'executive',
    include_avatar BOOLEAN DEFAULT FALSE,
    personal_info  JSON NOT NULL DEFAULT ('{}'),
    summary      TEXT NULL,
    skills       TEXT NULL,
    languages    TEXT NULL,
    headers      JSON NOT NULL DEFAULT ('{}'),
    sections     JSON NOT NULL DEFAULT ('[]'),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. COMPANIES & JOBS
-- ============================================================
CREATE TABLE companies (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id      CHAR(36) NOT NULL,
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) UNIQUE NULL,
    industry     VARCHAR(100) NULL,
    size         ENUM('1-10','11-50','51-200','201-500','500+') DEFAULT '11-50',
    headquarters VARCHAR(255) NULL,
    description  TEXT NULL,
    culture      TEXT NULL,
    benefits     TEXT NULL,
    website      VARCHAR(255) NULL,
    linkedin     VARCHAR(255) NULL,
    twitter      VARCHAR(255) NULL,
    logo         VARCHAR(500) NULL,
    is_verified  BOOLEAN DEFAULT FALSE,
    status       ENUM('Active','Inactive') DEFAULT 'Active',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    FULLTEXT INDEX ft_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recruiter_company (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recruiter_id CHAR(36) NOT NULL,
    company_id   CHAR(36) NOT NULL,
    role         ENUM('Admin','Manager','Staff') DEFAULT 'Staff',
    is_primary   BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id)   REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY uq_recruiter_company (recruiter_id, company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
    id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id       CHAR(36) NOT NULL,
    recruiter_id     CHAR(36) NOT NULL,
    title            VARCHAR(255) NOT NULL,
    description      LONGTEXT NOT NULL,
    requirements     TEXT NULL,
    benefits         TEXT NULL,
    location         VARCHAR(255) NULL,
    remote_policy    ENUM('Onsite','Hybrid','Remote') DEFAULT 'Hybrid',
    job_type         ENUM('Full-time','Part-time','Contract','Internship') DEFAULT 'Full-time',
    experience_level ENUM('Entry','Junior','Mid','Senior','Lead','Executive') DEFAULT 'Mid',
    salary_min       DECIMAL(12,2) NULL,
    salary_max       DECIMAL(12,2) NULL,
    currency         VARCHAR(3) DEFAULT 'USD',
    required_skills  JSON NOT NULL DEFAULT ('[]'),
    applications_count INT DEFAULT 0,
    views_count        INT DEFAULT 0,
    status           ENUM('Draft','Published','Closed','Archived') DEFAULT 'Draft',
    featured         BOOLEAN DEFAULT FALSE,
    published_at     TIMESTAMP NULL,
    closed_at        TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id)   REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status      (status),
    INDEX idx_company_id  (company_id),
    INDEX idx_published_at (published_at),
    FULLTEXT INDEX ft_title (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_applications (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    job_id       CHAR(36) NOT NULL,
    candidate_id CHAR(36) NOT NULL,
    status       ENUM('Applied','Reviewed','Interview','Offer','Hired','Rejected') DEFAULT 'Applied',
    match_score  INT DEFAULT 0,
    cover_letter TEXT NULL,
    notes        TEXT NULL,
    applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id)       REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_candidate (job_id, candidate_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interviews (
    id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id     CHAR(36) NOT NULL,
    job_id           CHAR(36) NOT NULL,
    recruiter_id     CHAR(36) NOT NULL,
    type             ENUM('Virtual','In-Person','Phone','Technical') NOT NULL,
    round            ENUM('Screening','Technical','HR','Final') NOT NULL,
    scheduled_at     DATETIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    timezone         VARCHAR(50) NULL,
    location         VARCHAR(255) NULL,
    meet_link        VARCHAR(500) NULL,
    agenda           TEXT NULL,
    notes            TEXT NULL,
    status           ENUM('Scheduled','Completed','Rescheduled','Cancelled') DEFAULT 'Scheduled',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id)       REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_status       (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. FEED / POSTS
-- ============================================================
CREATE TABLE posts (
    id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id          CHAR(36) NOT NULL,
    content          LONGTEXT NOT NULL,
    visibility       ENUM('public','connections','private') DEFAULT 'public',
    image_url        VARCHAR(500) NULL,
    attachments      JSON NULL,
    poll             JSON NULL,
    hashtags         JSON NULL,
    repost_of_id     CHAR(36) NULL,
    likes_count      INT UNSIGNED DEFAULT 0,
    insightful_count INT UNSIGNED DEFAULT 0,
    celebrate_count  INT UNSIGNED DEFAULT 0,
    support_count    INT UNSIGNED DEFAULT 0,
    comments_count   INT UNSIGNED DEFAULT 0,
    shares_count     INT UNSIGNED DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (repost_of_id) REFERENCES posts(id) ON DELETE SET NULL,
    INDEX idx_user_id   (user_id),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_reactions (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id    CHAR(36) NOT NULL,
    user_id    CHAR(36) NOT NULL,
    reaction   ENUM('like','insightful','celebrate','support','funny') DEFAULT 'like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_post (post_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_comments (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id    CHAR(36) NOT NULL,
    user_id    CHAR(36) NOT NULL,
    parent_id  CHAR(36) NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id)  REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE,
    INDEX idx_post_id  (post_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. CONNECTIONS & NOTIFICATIONS
-- ============================================================
CREATE TABLE user_connections (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    requester_id CHAR(36) NOT NULL,
    addressee_id CHAR(36) NOT NULL,
    status       ENUM('pending','accepted','declined','blocked') DEFAULT 'pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_connection (requester_id, addressee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id     CHAR(36) NOT NULL,
    category    ENUM('application','interview','message','connection','profile','job','system','moderation') DEFAULT 'system',
    title       VARCHAR(255) NOT NULL,
    description TEXT NULL,
    href        VARCHAR(500) NULL,
    priority    ENUM('high','medium','low') DEFAULT 'low',
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id  (user_id),
    INDEX idx_is_read  (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_tokens (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id    CHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. ADMIN TABLES
-- ============================================================
CREATE TABLE admin_roles (
    id          CHAR(36) PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_permissions (
    id         CHAR(36) PRIMARY KEY,
    code       VARCHAR(100) NOT NULL UNIQUE,
    label      VARCHAR(150) NOT NULL,
    module     VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_role_permissions (
    id            CHAR(36) PRIMARY KEY,
    role_id       CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_role_perm (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES admin_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_user_roles (
    id          CHAR(36) PRIMARY KEY,
    user_id     CHAR(36) NOT NULL,
    role_id     CHAR(36) NOT NULL,
    assigned_by CHAR(36) NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_role (user_id, role_id),
    FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_audit_logs (
    id           CHAR(36) PRIMARY KEY,
    actor_user_id CHAR(36) NOT NULL,
    actor_role   VARCHAR(50) NOT NULL,
    action_code  VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50) NOT NULL,
    entity_id    VARCHAR(50) NULL,
    payload      JSON NULL,
    ip_address   VARCHAR(64) NULL,
    user_agent   VARCHAR(255) NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_actor  (actor_user_id, created_at),
    INDEX idx_action (action_code, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_reports (
    id               CHAR(36) PRIMARY KEY,
    category         ENUM('spam','abuse','fake_job','harassment','other') NOT NULL,
    entity_type      ENUM('post','job','user','comment') NOT NULL,
    entity_id        CHAR(36) NOT NULL,
    reporter_user_id CHAR(36) NULL,
    details          TEXT NOT NULL,
    priority         ENUM('Low','Medium','High') DEFAULT 'Medium',
    status           ENUM('Open','Investigating','Resolved','Dismissed') DEFAULT 'Open',
    assigned_to      CHAR(36) NULL,
    admin_notes      TEXT NULL,
    resolved_at      TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status   (status, priority),
    INDEX idx_entity   (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. JOB PROMOTIONS
-- ============================================================
CREATE TABLE job_promotions (
    id             CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    job_id         CHAR(36) NOT NULL,
    recruiter_id   CHAR(36) NOT NULL,
    duration_days  INT NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    views_count    INT DEFAULT 0,
    clicks_count   INT DEFAULT 0,
    price          DECIMAL(10,2) NULL,
    payment_status ENUM('Pending','Paid','Refunded') DEFAULT 'Pending',
    status         ENUM('Pending','Active','Expired','Cancelled') DEFAULT 'Pending',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id)       REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status   (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
