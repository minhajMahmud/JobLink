-- JobLink Seed Data
-- admin@joblink.com -> Admin@1234
-- employer@joblink.com -> Employer@1234
-- seeker@joblink.com -> Seeker@1234

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO users (id, email, password, first_name, last_name, role, status, headline, location, bio, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@joblink.com', '$2y$12$u67jO9aOsrSrYEzlarSjwO2CkTStIDKVgHNZZcpG9mFj9QpZ9MouO', 'Super', 'Admin', 'Admin', 'Active', 'Platform Administrator', 'San Francisco, CA', 'Manages the JobLink platform.', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'employer@joblink.com', '$2y$12$WEuuTTMM7qmcEqMtmIb7gOyhS6yzz1cI27uicQXDomXQgnZWHpkpS', 'Sarah', 'Connor', 'Recruiter', 'Active', 'Head of Talent Acquisition', 'New York, NY', 'Passionate recruiter.', NOW()),
  ('00000000-0000-0000-0000-000000000003', 'seeker@joblink.com', '$2y$12$3OOXnd7XW/isdZIJ09CZae8ufwa9zwNzgUG9.DwtHdQwCtxhSuYqm', 'Alex', 'Morgan', 'Candidate', 'Active', 'Senior Software Engineer', 'Austin, TX', 'Full-stack engineer with 5+ years.', NOW());

INSERT INTO admin_profiles (id, user_id, access_level, department) VALUES (UUID(), '00000000-0000-0000-0000-000000000001', 'Super', 'Platform Operations');

INSERT INTO employer_profiles (id, user_id, company_name, company_size, industry, company_website, headquarters, is_verified) VALUES (UUID(), '00000000-0000-0000-0000-000000000002', 'TechCorp Inc.', '201-500', 'Technology', 'https://techcorp.example.com', 'New York, NY', TRUE);

INSERT INTO candidates (id, user_id, skills, experience_years, education_level, availability_status, salary_min, salary_max, profile_strength) VALUES (UUID(), '00000000-0000-0000-0000-000000000003', '["React","TypeScript","Node.js","PostgreSQL","Docker","AWS"]', 5, 'Bachelor', 'Actively Looking', 90000, 130000, 85);

SET FOREIGN_KEY_CHECKS = 1;