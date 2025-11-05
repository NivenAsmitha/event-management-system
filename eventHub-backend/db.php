<?php
// db.php
$host = 'localhost';
$user = 'root';
$pass = '1234';
$db   = 'EventHub_db';
$conn = new mysqli($host,$user,$pass,$db);
if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode(["success"=>false,"error"=>"DB connection failed"]));
}
$conn->set_charset("utf8mb4");
