<?php
// users.php (root)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, DELETE, OPTIONS");
header("Content-Type: application/json; charset=utf-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

function jexit($d,$c=200){ http_response_code($c); echo json_encode($d, JSON_UNESCAPED_SLASHES); exit; }
function idFromPath(){
  $u = strtok($_SERVER['REQUEST_URI'],'?');
  $p = explode('/', trim($u,'/'));
  $last = end($p);
  // allow numeric ids only (AUTO_INCREMENT)
  $id = ctype_digit($last) ? $last : '';
  if (!$id && isset($_GET['id']) && ctype_digit($_GET['id'])) $id = $_GET['id'];
  return $id;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = idFromPath();

/**
 * GET /api/users
 * Returns fields your React table expects:
 *  id, name (composed), email, role, avatar (NULL), joinDate (created_at)
 */
if ($method === 'GET' && !$id) {
  $sql = "
    SELECT
      id,
      CONCAT(first_name, ' ', last_name)       AS name,
      email,
      role,                                    -- enum('admin','user','photographer')
      NULL                                     AS avatar,   -- not stored; UI will fallback to initial
      created_at                               AS joinDate  -- UI uses this as 'join date'
    FROM users
    ORDER BY created_at DESC, id DESC
  ";
  $res = $conn->query($sql);
  $rows = [];
  if ($res) while ($r = $res->fetch_assoc()) $rows[] = $r;
  jexit($rows);
}

/**
 * DELETE /api/users/:id
 */
if ($id && $method === 'DELETE') {
  $idq = (int)$id;
  if ($conn->query("DELETE FROM users WHERE id = $idq")) jexit(['ok' => true]);
  jexit(['error' => 'DB error: '.$conn->error], 500);
}

jexit(['error' => 'Not found'], 404);
