-- Add Employer/Recruiter Account
-- Run this with: mysql -u root -p joblink < add-employer-account.sql

-- Insert employer user
INSERT INTO users (id, email, password, role, first_name, last_name, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'employer@demo.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Recruiter',
    'Demo',
    'Employer',
    NOW(),
    NOW()
);

-- Insert company for the employer
INSERT INTO companies (id, name, industry, size, location, website, logo, description, created_at, updated_at)
VALUES (
    '650e8400-e29b-41d4-a716-446655440001',
    'TechCorp Solutions',
    'Technology',
    '201-500',
    'San Francisco, CA',
    'https://techcorp.example.com',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
    'Leading technology company specializing in innovative software solutions and digital transformation.',
    NOW(),
    NOW()
);

-- Insert recruiter profile
INSERT INTO recruiters (id, user_id, company_id, position, bio, phone, created_at, updated_at)
VALUES (
    '750e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'Senior Talent Acquisition Manager',
    'Experienced recruiter with 8+ years in tech recruitment. Passionate about connecting talented professionals with great opportunities.',
    '+1-555-0123',
    NOW(),
    NOW()
);

-- Verify the account was created
SELECT 
    u.id,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    c.name as company_name,
    r.position
FROM users u
LEFT JOIN recruiters r ON r.user_id = u.id
LEFT JOIN companies c ON c.id = r.company_id
WHERE u.email = 'employer@demo.com';
