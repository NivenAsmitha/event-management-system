<?php
// sales.php (root)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

$res = $conn->query("SELECT id, date, eventTitle, tickets, amount, status FROM sales ORDER BY date DESC, id DESC");
$rows=[]; if($res) while($r=$res->fetch_assoc()) $rows[]=$r;
http_response_code(200);
echo json_encode($rows, JSON_UNESCAPED_SLASHES);
