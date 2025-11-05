<?php
// login.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD']==='OPTIONS') exit(0);

require 'db.php';

$data     = json_decode(file_get_contents('php://input'), true);
$username = $conn->real_escape_string($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) {
  http_response_code(400);
  echo json_encode(["success"=>false,"error"=>"Username & password required"]);
  exit;
}

$sql = "
  SELECT id, username, password, role
  FROM users
  WHERE username='$username'
  LIMIT 1
";
$res = $conn->query($sql);
if (!$res || $res->num_rows===0) {
  http_response_code(401);
  echo json_encode(["success"=>false,"error"=>"Invalid credentials"]);
  exit;
}

$user = $res->fetch_assoc();
if ($password !== $user['password']) {
  http_response_code(401);
  echo json_encode(["success"=>false,"error"=>"Invalid credentials"]);
  exit;
}

// success
echo json_encode([
  "success"  => true,
  "id"       => $user["id"],
  "username" => $user["username"],
  "role"     => $user["role"]
]);
