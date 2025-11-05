<?php
// upload_photo.php
require_once "db.php"; // your DB connection

header("Content-Type: application/json");

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "POST required"]);
    exit;
}

$user_id = $_POST['user_id'] ?? '';
if (!$user_id || !is_numeric($user_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing or invalid user_id"]);
    exit;
}

if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No image or upload error"]);
    exit;
}

$uploadDir = 'uploads/photos/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
$filename = uniqid('photo_', true) . '.' . strtolower($ext);
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetPath)) {
    // Store in DB
    $stmt = $pdo->prepare("INSERT INTO photographs (user_id, image_path) VALUES (?, ?)");
    $stmt->execute([$user_id, $targetPath]);

    echo json_encode(["success" => true, "message" => "Uploaded", "path" => $targetPath]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to move uploaded file"]);
}
