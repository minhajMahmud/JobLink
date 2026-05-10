-- Create Demo Users
-- Password for all accounts: "password"

-- Job Seeker Account
INSERT INTO users (id, email, password, role, first_name, last_name, status, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'seeker@demo.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Candidate',
    'Demo',
    'Seeker',
    'Active',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE email=email;

-- Employer Account
INSERT INTO users (id, email, password, role, first_name, last_name, status, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'employer@demo.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Recruiter',
    'Demo',
    'Employer',
    'Active',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE email=email;

-- Admin Account
INSERT INTO users (id, email, password, role, first_name, last_name, status, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'admin@demo.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'Demo',
    'Admin',
    'Active',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE email=email;

SELECT 'Demo users created successfully!' as message;
SELECT id, email, role, first_name, last_name FROM users WHERE email LIKE '%demo.com';
