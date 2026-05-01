-- JobLink Comprehensive SQLite Schema

-- Drop tables in reverse-dependency order
DROP TABLE IF EXISTS admin_reports;
DROP TABLE IF EXISTS admin_audit_logs;
DROP TABLE IF EXISTS admin_user_roles;
DROP TABLE IF EXISTS admin_role_permissions;
DROP TABLE IF EXISTS admin_permissions;
DROP TABLE IF EXISTS admin_roles;
DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_connections;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS post_reactions;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS recruiter_company;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS employer_profiles;
DROP TABLE IF EXISTS admin_profiles;
DROP TABLE IF EXISTS users;

-- 1. USERS
CREATE TABLE users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password      TEXT NOT NULL,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL DEFAULT '',
    role          TEXT NOT NULL DEFAULT 'Candidate',
    status        TEXT NOT NULL DEFAULT 'Active',
    phone         TEXT NULL,
    avatar_url    TEXT NULL,
    headline      TEXT NULL,
    location      TEXT NULL,
    website       TEXT NULL,
    bio           TEXT NULL,
    email_verified_at TIMESTAMP NULL,
    last_login_at     TIMESTAMP NULL,
    connections_count INTEGER DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADMIN PROFILES
CREATE TABLE admin_profiles (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL UNIQUE,
    access_level TEXT NOT NULL DEFAULT 'Support',
    department   TEXT NULL,
    notes        TEXT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. COMPANIES
CREATE TABLE companies (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    industry    TEXT NULL,
    website     TEXT NULL,
    location    TEXT NULL,
    description TEXT NULL,
    logo_url    TEXT NULL,
    status      TEXT DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. EMPLOYER / RECRUITER PROFILES
CREATE TABLE employer_profiles (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL UNIQUE,
    company_name    TEXT NOT NULL,
    company_size    TEXT DEFAULT '11-50',
    industry        TEXT NULL,
    company_website TEXT NULL,
    headquarters    TEXT NULL,
    is_verified     INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. CANDIDATE PROFILES
CREATE TABLE candidates (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL UNIQUE,
    skills              TEXT NULL,
    experience_years    INTEGER DEFAULT 0,
    education_level     TEXT NULL,
    availability_status TEXT DEFAULT 'Open',
    salary_min          INTEGER DEFAULT 0,
    salary_max          INTEGER DEFAULT 0,
    profile_strength    INTEGER DEFAULT 0,
    resume_path         TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. JOBS
CREATE TABLE jobs (
    id               TEXT PRIMARY KEY,
    company_id       TEXT NOT NULL,
    recruiter_id     TEXT NOT NULL,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    requirements     TEXT NULL,
    benefits         TEXT NULL,
    location         TEXT NULL,
    remote_policy    TEXT DEFAULT 'Hybrid',
    job_type         TEXT DEFAULT 'Full-time',
    experience_level TEXT DEFAULT 'Mid',
    salary_min       REAL NULL,
    salary_max       REAL NULL,
    currency         TEXT DEFAULT 'USD',
    required_skills  TEXT NOT NULL DEFAULT '[]',
    applications_count INTEGER DEFAULT 0,
    views_count        INTEGER DEFAULT 0,
    status           TEXT DEFAULT 'Draft',
    featured         INTEGER DEFAULT 0,
    published_at     TIMESTAMP NULL,
    closed_at        TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id)   REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. JOB APPLICATIONS
CREATE TABLE job_applications (
    id           TEXT PRIMARY KEY,
    job_id       TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    status       TEXT DEFAULT 'Applied',
    match_score  INTEGER DEFAULT 0,
    cover_letter TEXT NULL,
    notes        TEXT NULL,
    applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id)       REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE(job_id, candidate_id)
);

-- 8. POSTS
CREATE TABLE posts (
    id               TEXT PRIMARY KEY,
    user_id          TEXT NOT NULL,
    content          TEXT NOT NULL,
    visibility       TEXT DEFAULT 'public',
    image_url        TEXT NULL,
    attachments      TEXT NULL,
    poll             TEXT NULL,
    hashtags         TEXT NULL,
    repost_of_id     TEXT NULL,
    likes_count      INTEGER DEFAULT 0,
    insightful_count INTEGER DEFAULT 0,
    celebrate_count  INTEGER DEFAULT 0,
    support_count    INTEGER DEFAULT 0,
    comments_count   INTEGER DEFAULT 0,
    shares_count     INTEGER DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (repost_of_id) REFERENCES posts(id) ON DELETE SET NULL
);

-- 9. USER CONNECTIONS
CREATE TABLE user_connections (
    id           TEXT PRIMARY KEY,
    requester_id TEXT NOT NULL,
    addressee_id TEXT NOT NULL,
    status       TEXT DEFAULT 'pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(requester_id, addressee_id)
);

-- 10. NOTIFICATIONS
CREATE TABLE notifications (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    category    TEXT DEFAULT 'system',
    title       TEXT NOT NULL,
    description TEXT NULL,
    href        TEXT NULL,
    priority    TEXT DEFAULT 'low',
    is_read     INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Data
INSERT INTO users (id, email, password, first_name, last_name, role, status, headline, location, bio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@joblink.com', '$2y$12$u67jO9aOsrSrYEzlarSjwO2CkTStIDKVgHNZZcpG9mFj9QpZ9MouO', 'Super', 'Admin', 'Admin', 'Active', 'Platform Administrator', 'San Francisco, CA', 'Manages the JobLink platform.'),
  ('00000000-0000-0000-0000-000000000002', 'employer@joblink.com', '$2y$12$WEuuTTMM7qmcEqMtmIb7gOyhS6yzz1cI27uicQXDomXQgnZWHpkpS', 'Sarah', 'Connor', 'Recruiter', 'Active', 'Head of Talent Acquisition', 'New York, NY', 'Passionate recruiter.'),
  ('00000000-0000-0000-0000-000000000003', 'seeker@joblink.com', '$2y$12$3OOXnd7XW/isdZIJ09CZae8ufwa9zwNzgUG9.DwtHdQwCtxhSuYqm', 'Alex', 'Morgan', 'Candidate', 'Active', 'Senior Software Engineer', 'Austin, TX', 'Full-stack engineer with 5+ years.');

INSERT INTO admin_profiles (id, user_id, access_level, department) VALUES ('admin-prof-1', '00000000-0000-0000-0000-000000000001', 'Super', 'Platform Operations');

INSERT INTO employer_profiles (id, user_id, company_name, company_size, industry, company_website, headquarters, is_verified) VALUES ('emp-prof-1', '00000000-0000-0000-0000-000000000002', 'TechCorp Inc.', '201-500', 'Technology', 'https://techcorp.example.com', 'New York, NY', 1);

INSERT INTO candidates (id, user_id, skills, experience_years, education_level, availability_status, salary_min, salary_max, profile_strength) VALUES ('cand-prof-1', '00000000-0000-0000-0000-000000000003', '["React","TypeScript","Node.js","PostgreSQL","Docker","AWS"]', 5, 'Bachelor', 'Actively Looking', 90000, 130000, 85);
