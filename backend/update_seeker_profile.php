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

// Step 1: Update the users table with profile info
$sql = "UPDATE users SET 
    headline = 'Full Stack Developer | React & Node.js Specialist',
    location = 'San Francisco, CA',
    bio = 'Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies. Looking for opportunities to work on challenging projects with innovative teams.',
    website = 'https://johnsseeker.dev',
    phone = '+1-555-123-4567'
WHERE email = 'seeker@demo.com'";

if ($conn->query($sql)) {
    echo "✓ Updated user profile (headline, location, bio, etc.)\n";
} else {
    echo "⚠️ Error updating user: " . $conn->error . "\n";
}

// Step 2: Get the candidate_id for seeker
$result = $conn->query("SELECT id FROM candidates WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'");
$candidate = $result->fetch_assoc();
$candidate_id = $candidate['id'] ?? null;

if (!$candidate_id) {
    // Create candidate if doesn't exist
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
    )";
    
    if ($conn->query($sql)) {
        echo "✓ Created candidate profile\n";
        // Get the new candidate ID
        $result = $conn->query("SELECT id FROM candidates WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'");
        $candidate = $result->fetch_assoc();
        $candidate_id = $candidate['id'];
    } else {
        die("❌ Error creating candidate: " . $conn->error . "\n");
    }
} else {
    // Update existing candidate
    $sql = "UPDATE candidates SET 
        skills = JSON_ARRAY('React', 'Node.js', 'JavaScript', 'TypeScript', 'MySQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'REST APIs'),
        experience_years = 5,
        education_level = 'Bachelor',
        availability_status = 'Actively Looking',
        updated_at = NOW()
    WHERE id = '$candidate_id'";
    
    if ($conn->query($sql)) {
        echo "✓ Updated candidate profile skills and experience\n";
    } else {
        echo "⚠️ Error updating candidate: " . $conn->error . "\n";
    }
}

// Step 3: Add education records
$educationSql = "INSERT INTO candidate_education (id, candidate_id, school, field_of_study, degree, start_date, end_date, created_at)
VALUES 
    (UUID(), '$candidate_id', 'University of California, Berkeley', 'Computer Science', 'Bachelor of Science', '2018-09-01', '2022-05-31', NOW()),
    (UUID(), '$candidate_id', 'General Assembly', 'Web Development', 'Certificate', '2018-01-01', '2018-03-31', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()";

if ($conn->query($educationSql)) {
    echo "✓ Added education records (2)\n";
} else {
    echo "⚠️ Education records error: " . $conn->error . "\n";
}

// Step 4: Add experience records
$experienceSql = "INSERT INTO candidate_experiences (id, candidate_id, title, company, start_date, end_date, is_current, description, created_at)
VALUES 
    (UUID(), '$candidate_id', 'Senior Full Stack Developer', 'Tech Startup Inc', '2021-06-01', NULL, 1, 'Leading development of scalable web applications using React and Node.js. Mentoring junior developers and implementing best practices for code quality.', NOW()),
    (UUID(), '$candidate_id', 'Full Stack Developer', 'Digital Solutions Co', '2019-03-01', '2021-05-31', 0, 'Developed and maintained multiple client-facing web applications. Collaborated with product and design teams to deliver high-quality solutions.', NOW()),
    (UUID(), '$candidate_id', 'Junior Developer', 'Web Agency', '2018-06-01', '2019-02-28', 0, 'Built responsive web applications using React. Fixed bugs and implemented features based on client feedback.', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()";

if ($conn->query($experienceSql)) {
    echo "✓ Added experience records (3)\n";
} else {
    echo "⚠️ Experience records error: " . $conn->error . "\n";
}

// Step 5: Add projects
$projectsSql = "INSERT INTO candidate_projects (id, candidate_id, title, description, technologies, link, start_date, end_date, is_current, created_at)
VALUES 
    (UUID(), '$candidate_id', 'JobLink - Professional Network', 'A full-stack professional networking platform built with React, Node.js, and MySQL. Features include job search, profile management, feed, and messaging.', JSON_ARRAY('React','Node.js','MySQL','AWS','Docker','TypeScript'), 'https://github.com/johnsseeker/joblink', '2023-06-01', NULL, 1, NOW()),
    (UUID(), '$candidate_id', 'E-Commerce Platform', 'Built a complete e-commerce solution with product catalog, shopping cart, and payment integration using Stripe.', JSON_ARRAY('React','Node.js','MongoDB','Stripe','AWS'), 'https://github.com/johnsseeker/ecommerce', '2022-09-01', '2023-05-31', 0, NOW()),
    (UUID(), '$candidate_id', 'Task Management App', 'Collaborative task management application with real-time updates using WebSockets.', JSON_ARRAY('React','Node.js','Socket.io','MongoDB'), 'https://github.com/johnsseeker/taskapp', '2021-12-01', '2022-08-31', 0, NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()";

if ($conn->query($projectsSql)) {
    echo "✓ Added project records (3)\n";
} else {
    echo "⚠️ Projects error: " . $conn->error . "\n";
}

// Step 6: Add certifications
$certsSql = "INSERT INTO candidate_certifications (id, candidate_id, name, issuer, issue_date, expiry_date, credential_url, created_at)
VALUES 
    (UUID(), '$candidate_id', 'AWS Certified Solutions Architect', 'Amazon Web Services', '2023-03-15', '2025-03-15', 'https://aws.amazon.com/certification', NOW()),
    (UUID(), '$candidate_id', 'Google Cloud Professional Data Engineer', 'Google Cloud', '2022-11-20', NULL, 'https://cloud.google.com/certification', NOW()),
    (UUID(), '$candidate_id', 'Docker Certified Associate', 'Docker', '2022-06-10', '2024-06-10', 'https://www.docker.com/certification', NOW())";

if ($conn->query($certsSql)) {
    echo "✓ Added certification records (3)\n";
} else {
    echo "⚠️ Certifications error: " . $conn->error . "\n";
}

echo "\n✅ Profile data updated successfully!\n";
echo "\nProfile now includes:\n";
echo "  • Headline: Full Stack Developer | React & Node.js Specialist\n";
echo "  • Location: San Francisco, CA\n";
echo "  • Experience: 5 years\n";
echo "  • Skills: React, Node.js, JavaScript, TypeScript, MySQL, MongoDB, AWS, Docker, Git, REST APIs\n";
echo "  • Education: 2 records\n";
echo "  • Work Experience: 3 positions\n";
echo "  • Projects: 3 projects\n";
echo "  • Certifications: 3 certifications\n";

$conn->close();
?>
