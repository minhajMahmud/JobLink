-- Base Tables for JobLink System
-- Create fundamental tables that other tables depend on

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('Candidate', 'Recruiter', 'Admin') NOT NULL DEFAULT 'Candidate',
    email_verified_at TIMESTAMP NULL,
    status ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description LONGTEXT,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    industry VARCHAR(100),
    size ENUM('1-50', '51-200', '201-500', '500+') DEFAULT '51-200',
    founded_year INT,
    headquarters_location VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status),
    FULLTEXT INDEX ft_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recruiter Company Association
CREATE TABLE IF NOT EXISTS recruiter_company (
    id CHAR(36) PRIMARY KEY,
    recruiter_id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    role ENUM('Admin', 'Manager', 'Staff') NOT NULL DEFAULT 'Staff',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY uq_recruiter_company (recruiter_id, company_id),
    INDEX idx_recruiter_id (recruiter_id),
    INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id CHAR(36) PRIMARY KEY,
    company_id CHAR(36) NOT NULL,
    recruiter_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description LONGTEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    job_type ENUM('Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship') NOT NULL DEFAULT 'Full-time',
    experience_level ENUM('Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive') DEFAULT 'Mid',
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    skills JSON NOT NULL,
    applications_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    status ENUM('Draft', 'Published', 'Closed', 'Archived') NOT NULL DEFAULT 'Draft',
    published_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_recruiter_id (recruiter_id),
    INDEX idx_status (status),
    INDEX idx_job_type (job_type),
    INDEX idx_published_at (published_at),
    FULLTEXT INDEX ft_search (title, description, requirements)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
