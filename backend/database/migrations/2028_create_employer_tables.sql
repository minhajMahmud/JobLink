CREATE TABLE companies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL, -- The owner
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50),
    headquarters VARCHAR(255),
    description TEXT,
    culture TEXT,
    benefits TEXT,
    website VARCHAR(255),
    linkedin VARCHAR(255),
    twitter VARCHAR(255),
    logo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    remote_policy ENUM('Onsite', 'Hybrid', 'Remote') DEFAULT 'Hybrid',
    salary_min INT,
    salary_max INT,
    type ENUM('Full-time', 'Part-time', 'Contract') DEFAULT 'Full-time',
    level ENUM('Entry', 'Mid', 'Senior', 'Lead') DEFAULT 'Mid',
    required_skills JSON NOT NULL DEFAULT '[]',
    description TEXT NOT NULL,
    status ENUM('Active', 'Paused', 'Closed') DEFAULT 'Active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_applications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    job_id CHAR(36) NOT NULL,
    candidate_id CHAR(36) NOT NULL,
    status ENUM('Applied', 'Reviewed', 'Interview', 'Offer', 'Hired', 'Rejected') DEFAULT 'Applied',
    match_score INT DEFAULT 0,
    notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_candidate (job_id, candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
