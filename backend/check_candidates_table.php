<?php
$host = '127.0.0.1';
$username = 'root';
$password = 'root';
$database = 'joblink';

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$result = $conn->query("DESCRIBE candidates");
echo "📋 Candidates Table Structure:\n\n";
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}
$conn->close();
?>
