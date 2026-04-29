CREATE TABLE candidate_resumes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    theme VARCHAR(50) DEFAULT 'executive',
    include_avatar BOOLEAN DEFAULT FALSE,
    personal_info JSON NOT NULL, -- name, title, email, phone, address, linkedin, github
    summary TEXT,
    skills TEXT,
    languages TEXT,
    headers JSON NOT NULL, -- Custom headers for sections
    sections JSON NOT NULL, -- Array of experience, education, projects, certs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_resume (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
