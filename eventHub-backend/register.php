<?php
// register.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD']==='OPTIONS') exit(0);

require 'db.php';

$data        = json_decode(file_get_contents('php://input'), true);
$first_name  = $conn->real_escape_string($data['first_name'] ?? '');
$last_name   = $conn->real_escape_string($data['last_name']  ?? '');
$username    = $conn->real_escape_string($data['username']   ?? '');
$email       = $conn->real_escape_string($data['email']      ?? '');
$phone       = $conn->real_escape_string($data['phone']      ?? '');
$password    = $data['password']   ?? '';
$role        = in_array($data['role'], ['admin','user','photographer'])
               ? $data['role'] 
               : 'user';

if (!$first_name || !$last_name || !$username || !$email || !$password) {
  http_response_code(400);
  echo json_encode(["success"=>false,"error"=>"All fields required"]);
  exit;
}

// duplicate check
$dup = $conn->query(
  "SELECT 1 FROM users WHERE username='$username' OR email='$email'"
)->num_rows;
if ($dup) {
  http_response_code(409);
  echo json_encode(["success"=>false,"error"=>"Username or email already taken"]);
  exit;
}

$sql = "
  INSERT INTO users
    (first_name,last_name,username,email,phone,password,role)
  VALUES
    ('$first_name','$last_name','$username','$email','$phone','$password','$role')
";
if ($conn->query($sql)) {
  echo json_encode(["success"=>true,"id"=>$conn->insert_id]);
} else {
  http_response_code(500);
  echo json_encode(["success"=>false,"error"=>"DB error"]);
}
