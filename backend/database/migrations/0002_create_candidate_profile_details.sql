-- Candidate Profile Details Tables
-- Extended profile information: experience, education, projects, publications, endorsements

-- Candidate Experience
CREATE TABLE IF NOT EXISTS candidate_experiences (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Candidate Education
CREATE TABLE IF NOT EXISTS candidate_education (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description LONGTEXT,
    grade VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Candidate Projects/Portfolio
CREATE TABLE IF NOT EXISTS candidate_projects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    link VARCHAR(500),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    technologies JSON,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Candidate Publications
CREATE TABLE IF NOT EXISTS candidate_publications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    publication_date DATE,
    link VARCHAR(500),
    description LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_publication_date (publication_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Candidate Skill Endorsements
CREATE TABLE IF NOT EXISTS candidate_skill_endorsements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    endorsement_count INT DEFAULT 0,
    top_endorsers JSON,
    last_endorsed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY uq_candidate_skill (candidate_id, skill_name),
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_endorsement_count (endorsement_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Candidate Certifications/Badges
CREATE TABLE IF NOT EXISTS candidate_certifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    candidate_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    issue_date DATE,
    expiration_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_issue_date (issue_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
