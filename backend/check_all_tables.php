<?php
$host = '127.0.0.1';
$username = 'root';
$password = 'root';
$database = 'joblink';

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$tables = ['candidate_education', 'candidate_experiences', 'candidate_projects', 'candidate_certifications'];

foreach ($tables as $table) {
    echo "\n📋 $table:\n";
    $result = $conn->query("DESCRIBE $table");
    while ($row = $result->fetch_assoc()) {
        echo "  - " . $row['Field'] . "\n";
    }
}

$conn->close();
?>
