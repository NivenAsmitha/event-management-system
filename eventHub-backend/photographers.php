<?php
// photographers.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

function json_error($msg) {
  http_response_code(500);
  echo json_encode(["success" => false, "error" => $msg]);
  exit;
}

function get_input_data() {
  if (strpos($_SERVER["CONTENT_TYPE"] ?? '', 'application/json') !== false) {
    return json_decode(file_get_contents("php://input"), true);
  }
  return $_POST;
}

// ---- LIST photographers ----
if ($method === 'GET') {
  $res = $conn->query("SELECT id, first_name, last_name, username, email, phone, avatar FROM users WHERE role='photographer'");
  $photographers = [];
  while ($row = $res->fetch_assoc()) $photographers[] = $row;
  echo json_encode($photographers);
  exit;
}

// ---- CREATE photographer ----
if ($method === 'POST') {
  $data = get_input_data();

  $first_name = $data['first_name'] ?? '';
  $last_name = $data['last_name'] ?? '';
  $username = $data['username'] ?? '';
  $email = $data['email'] ?? '';
  $phone = $data['phone'] ?? '';
  $password = $data['password'] ?? '';
  $avatarPath = null;

  if (!$first_name || !$last_name || !$username || !$email || !$password) {
    json_error("Missing required fields");
  }

  if (isset($_FILES['avatar'])) {
    $file = $_FILES['avatar'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $avatarPath = 'uploads/' . uniqid() . '.' . $ext;
    move_uploaded_file($file['tmp_name'], $avatarPath);
  }

  $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, username, email, phone, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?, 'photographer', ?)");
  $stmt->bind_param("sssssss", $first_name, $last_name, $username, $email, $phone, $password, $avatarPath);
  $stmt->execute();

  echo json_encode(["success" => true]);
  exit;
}

// ---- UPDATE photographer ----
if ($method === 'PUT') {
  parse_str($_SERVER['QUERY_STRING'], $query);
  $id = $query['id'] ?? null;
  if (!$id) json_error("Missing ID");

  $data = get_input_data();
  $first_name = $data['first_name'] ?? '';
  $last_name = $data['last_name'] ?? '';
  $username = $data['username'] ?? '';
  $email = $data['email'] ?? '';
  $phone = $data['phone'] ?? '';
  $password = $data['password'] ?? '';
  $avatarPath = null;

  if (isset($_FILES['avatar'])) {
    $file = $_FILES['avatar'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $avatarPath = 'uploads/' . uniqid() . '.' . $ext;
    move_uploaded_file($file['tmp_name'], $avatarPath);
  }

  $sql = "UPDATE users SET first_name=?, last_name=?, username=?, email=?, phone=?";
  $params = [$first_name, $last_name, $username, $email, $phone];
  $types = "sssss";

  if (!empty($password)) {
    $sql .= ", password=?";
    $params[] = $password;
    $types .= "s";
  }

  if (!empty($avatarPath)) {
    $sql .= ", avatar=?";
    $params[] = $avatarPath;
    $types .= "s";
  }

  $sql .= " WHERE id=?";
  $params[] = $id;
  $types .= "i";

  $stmt = $conn->prepare($sql);
  $stmt->bind_param($types, ...$params);
  $stmt->execute();

  echo json_encode(["success" => true]);
  exit;
}

// ---- DELETE photographer ----
if ($method === 'DELETE') {
  parse_str($_SERVER['QUERY_STRING'], $query);
  $id = $query['id'] ?? null;
  if (!$id) json_error("Missing ID");

  $conn->query("DELETE FROM users WHERE id=$id AND role='photographer'");
  echo json_encode(["success" => true]);
  exit;
}

json_error("Unsupported request");
