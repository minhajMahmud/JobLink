<?php

// Update demo user with complete profile information

$host = '127.0.0.1';
$username = 'root';
$password = 'root';
$database = 'joblink';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error . "\n");
}

echo "✅ Connected to database\n\n";

// Update the seeker user with complete profile data
$sql = "UPDATE users SET 
    headline = 'Full Stack Developer | React & Node.js Specialist',
    location = 'San Francisco, CA',
    bio = 'Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies. Looking for opportunities to work on challenging projects with innovative teams.',
    website = 'https://johnsseeker.dev',
    phone = '+1-555-123-4567'
WHERE email = 'seeker@demo.com'";

if ($conn->query($sql)) {
    echo "✓ Updated user profile\n";
} else {
    echo "⚠️ Error updating user: " . $conn->error . "\n";
}

// Add candidate profile details
$sql = "INSERT INTO candidates (id, user_id, skills, experience_years, education_level, availability_status, created_at, updated_at)
VALUES (
    UUID(),
    '550e8400-e29b-41d4-a716-446655440001',
    JSON_ARRAY('React', 'Node.js', 'JavaScript', 'TypeScript', 'MySQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'REST APIs'),
    5,
    'Bachelor',
    'Actively Looking',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    skills = JSON_ARRAY('React', 'Node.js', 'JavaScript', 'TypeScript', 'MySQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'REST APIs'),
    experience_years = 5,
    education_level = 'Bachelor',
    availability_status = 'Actively Looking',
    updated_at = NOW()";

if ($conn->query($sql)) {
    echo "✓ Added candidate profile details\n";
} else {
    echo "⚠️ Note: Candidate record may already exist or: " . $conn->error . "\n";
}

// Add education records
$educationSql = "INSERT INTO candidate_education (id, user_id, school_name, field_of_study, degree, start_date, end_date, created_at)
VALUES 
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'University of California, Berkeley', 'Computer Science', 'Bachelor of Science', '2018-09-01', '2022-05-31', NOW()),
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'General Assembly', 'Web Development', 'Certificate', '2018-01-01', '2018-03-31', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()";

if ($conn->query($educationSql)) {
    echo "✓ Added education records\n";
} else {
    echo "⚠️ Education records: " . $conn->error . "\n";
}

// Add experience records
$experienceSql = "INSERT INTO candidate_experiences (id, user_id, job_title, company_name, employment_type, location, start_date, end_date, description, created_at)
VALUES 
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'Senior Full Stack Developer', 'Tech Startup Inc', 'Full-time', 'San Francisco, CA', '2021-06-01', NULL, 'Leading development of scalable web applications using React and Node.js. Mentoring junior developers and implementing best practices for code quality.', NOW()),
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'Full Stack Developer', 'Digital Solutions Co', 'Full-time', 'San Francisco, CA', '2019-03-01', '2021-05-31', 'Developed and maintained multiple client-facing web applications. Collaborated with product and design teams to deliver high-quality solutions.', NOW()),
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'Junior Developer', 'Web Agency', 'Full-time', 'Oakland, CA', '2018-06-01', '2019-02-28', 'Built responsive web applications using React. Fixed bugs and implemented features based on client feedback.', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()";

if ($conn->query($experienceSql)) {
    echo "✓ Added experience records\n";
} else {
    echo "⚠️ Experience records: " . $conn->error . "\n";
}

// Add projects
$projectsSql = "INSERT INTO candidate_projects (id, user_id, project_name, description, technologies, project_url, start_date, end_date, created_at)
VALUES 
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'JobLink - Professional Network', 'A full-stack professional networking platform built with React, Node.js, and MySQL. Features include job search, profile management, feed, and messaging.', 'React,Node.js,MySQL,AWS,Docker,TypeScript', 'https://github.com/johnsseeker/joblink', '2023-06-01', NULL, NOW()),
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'E-Commerce Platform', 'Built a complete e-commerce solution with product catalog, shopping cart, and payment integration using Stripe.', 'React,Node.js,MongoDB,Stripe,AWS', 'https://github.com/johnsseeker/ecommerce', '2022-09-01', '2023-05-31', NOW()),
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'Task Management App', 'Collaborative task management application with real-time updates using WebSockets.', 'React,Node.js,Socket.io,MongoDB', 'https://github.com/johnsseeker/taskapp', '2021-12-01', '2022-08-31', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()";

if ($conn->query($projectsSql)) {
    echo "✓ Added project records\n";
} else {
    echo "⚠️ Projects: " . $conn->error . "\n";
}

// Add certifications
$certsSql = "INSERT INTO candidate_certifications (id, user_id, certification_name, issuer, issue_date, expiry_date, credential_url, created_at)
VALUES 
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'AWS Certified Solutions Architect', 'Amazon Web Services', '2023-03-15', '2025-03-15', 'https://aws.amazon.com/certification', NOW()),
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'Google Cloud Professional Data Engineer', 'Google Cloud', '2022-11-20', NULL, 'https://cloud.google.com/certification', NOW()),
    (UUID(), '550e8400-e29b-41d4-a716-446655440001', 'Docker Certified Associate', 'Docker', '2022-06-10', '2024-06-10', 'https://www.docker.com/certification', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()";

if ($conn->query($certsSql)) {
    echo "✓ Added certification records\n";
} else {
    echo "⚠️ Certifications: " . $conn->error . "\n";
}

echo "\n✅ Profile data updated successfully!\n";
echo "\nProfile includes:\n";
echo "  • Headline: Full Stack Developer | React & Node.js Specialist\n";
echo "  • Location: San Francisco, CA\n";
echo "  • Experience: 5 years\n";
echo "  • Skills: React, Node.js, JavaScript, TypeScript, MySQL, MongoDB, AWS, Docker, Git, REST APIs\n";
echo "  • Education: 2 records (UC Berkeley, General Assembly)\n";
echo "  • Work Experience: 3 positions\n";
echo "  • Projects: 3 projects\n";
echo "  • Certifications: 3 certifications\n";

$conn->close();
?>
