<?php
// list_photos.php
require_once "db.php";

header("Content-Type: application/json");

$user_id = $_GET['user_id'] ?? '';
if (!$user_id || !is_numeric($user_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid user ID"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, image_path, created_at FROM photographs WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$user_id]);
$photos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "data" => $photos]);
