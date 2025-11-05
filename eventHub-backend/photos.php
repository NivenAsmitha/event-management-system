<?php
// /api/photos.php  (adjust path or rewrite rule as you do for events.php)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/db.php'; // provides $conn (mysqli)

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = strtok($_SERVER['REQUEST_URI'] ?? '', '?');

$uploadsDir = __DIR__ . '/uploads/photographer';
$publicPrefix = '/uploads/photographer';
if (!is_dir($uploadsDir)) { @mkdir($uploadsDir, 0775, true); }

function bad($code, $msg) { http_response_code($code); echo json_encode(["success"=>false,"error"=>$msg]); exit; }

function parseIdFromUri($uri) {
  $parts = array_values(array_filter(explode('/', trim($uri, '/'))));
  if (!$parts) return null;
  $last = end($parts);
  return ctype_digit($last) ? (int)$last : null;
}
$photoId = parseIdFromUri($uri);

// normalize $_FILES images[]
function rearrayFiles($filesField) {
  $out = [];
  if (!isset($filesField['name'])) return $out;
  if (is_array($filesField['name'])) {
    $n = count($filesField['name']);
    for ($i=0; $i<$n; $i++) {
      if (($filesField['error'][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) continue;
      $out[] = [
        'name' => $filesField['name'][$i],
        'type' => $filesField['type'][$i],
        'tmp_name' => $filesField['tmp_name'][$i],
        'error' => $filesField['error'][$i],
        'size' => $filesField['size'][$i],
      ];
    }
  } else {
    if (($filesField['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) $out[] = $filesField;
  }
  return $out;
}

function saveUploads($field = 'images') {
  global $uploadsDir, $publicPrefix;
  $saved = [];
  if (!isset($_FILES[$field])) return $saved;
  $files = rearrayFiles($_FILES[$field]);
  foreach ($files as $f) {
    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg','jpeg','png','gif','webp'])) $ext = 'jpg';
    $name = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $uploadsDir . '/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) continue;
    $saved[] = $publicPrefix . '/' . $name;
  }
  return $saved;
}

try {
  switch ($method) {
    case 'GET': {
      // filters: ?status=approved|pending|rejected & photographer_id= & event_id=
      $status = $_GET['status'] ?? null;
      $photographerId = isset($_GET['photographer_id']) ? (int)$_GET['photographer_id'] : null;
      $eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : null;

      if ($photoId) {
        $stmt = $conn->prepare("SELECT * FROM photographer_photos WHERE id=?");
        $stmt->bind_param("i", $photoId);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();
        if (!$row) bad(404, "Photo not found");
        echo json_encode(["success"=>true, "data"=>$row]); break;
      }

      $sql = "SELECT * FROM photographer_photos WHERE 1";
      $types = ""; $params = [];
      if ($status) { $sql .= " AND status = ?"; $types .= "s"; $params[] = $status; }
      if ($photographerId) { $sql .= " AND photographer_id = ?"; $types .= "i"; $params[] = $photographerId; }
      if ($eventId) { $sql .= " AND event_id = ?"; $types .= "i"; $params[] = $eventId; }
      $sql .= " ORDER BY created_at DESC, id DESC";

      if ($types) {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();
      } else {
        $res = $conn->query($sql);
      }

      $out = [];
      while ($r = $res->fetch_assoc()) $out[] = $r;
      if (isset($stmt)) $stmt->close();
      echo json_encode(["success"=>true,"data"=>$out]);
      break;
    }

    case 'POST': {
      // multipart: photographer_id(required), event_id(optional), caption(optional), images[] (1..N)
      $isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false;
      if (!$isMultipart) bad(400, "Use multipart/form-data with images[]");

      $photographerId = (int)($_POST['photographer_id'] ?? 0);
      $eventId = isset($_POST['event_id']) ? (int)$_POST['event_id'] : null;
      $caption = $_POST['caption'] ?? null;
      if ($photographerId <= 0) bad(400, "photographer_id is required");

      $paths = saveUploads('images');
      if (!$paths) bad(400, "No images attached");

      $ins = $conn->prepare("INSERT INTO photographer_photos (photographer_id, event_id, path, caption, status) VALUES (?, ?, ?, ?, 'pending')");
      foreach ($paths as $p) {
        if ($eventId) { $ins->bind_param("iiss", $photographerId, $eventId, $p, $caption); }
        else { $null = null; $ins->bind_param("iiss", $photographerId, $null, $p, $caption); }
        $ins->execute();
      }
      $ins->close();

      // return back the newly created rows for this photographer (latest first)
      $stmt = $conn->prepare("SELECT * FROM photographer_photos WHERE photographer_id=? ORDER BY created_at DESC, id DESC LIMIT 100");
      $stmt->bind_param("i", $photographerId);
      $stmt->execute();
      $res = $stmt->get_result();
      $out = [];
      while ($r = $res->fetch_assoc()) $out[] = $r;
      $stmt->close();

      echo json_encode(["success"=>true,"data"=>$out]);
      break;
    }

    case 'PUT': {
      if (!$photoId) bad(400, "Photo ID is required");
      $input = json_decode(file_get_contents('php://input'), true) ?? [];
      $status = $input['status'] ?? null; // 'approved'|'rejected'|'pending'
      $caption = array_key_exists('caption', $input) ? $input['caption'] : null;
      $eventId = array_key_exists('event_id', $input) ? $input['event_id'] : null;

      // build dynamic update
      $fields = []; $types=""; $params=[];
      if ($status) {
        $fields[] = "status = ?";
        $types .= "s"; $params[] = $status;
        // track approved_at
        if ($status === 'approved') { $fields[] = "approved_at = NOW()"; }
        else { $fields[] = "approved_at = NULL"; }
      }
      if ($caption !== null) { $fields[] = "caption = ?"; $types.="s"; $params[]=$caption; }
      if ($eventId !== null) {
        if ($eventId === "" || $eventId === false) { $fields[] = "event_id = NULL"; }
        else { $fields[] = "event_id = ?"; $types.="i"; $params[]=(int)$eventId; }
      }
      if (!$fields) bad(400, "Nothing to update");

      $sql = "UPDATE photographer_photos SET ".implode(", ", $fields)." WHERE id = ?";
      $types .= "i"; $params[] = $photoId;
      $stmt = $conn->prepare($sql);
      $stmt->bind_param($types, ...$params);
      if (!$stmt->execute()) bad(500, "Update failed");
      $stmt->close();

      // return updated row
      $stmt = $conn->prepare("SELECT * FROM photographer_photos WHERE id=?");
      $stmt->bind_param("i", $photoId);
      $stmt->execute();
      $res = $stmt->get_result();
      $row = $res->fetch_assoc();
      $stmt->close();
      if (!$row) bad(404, "Photo not found");
      echo json_encode(["success"=>true,"data"=>$row]);
      break;
    }

    case 'DELETE': {
      if (!$photoId) bad(400, "Photo ID is required");
      $stmt = $conn->prepare("DELETE FROM photographer_photos WHERE id=?");
      $stmt->bind_param("i", $photoId);
      if (!$stmt->execute()) bad(500, "Delete failed");
      $affected = $stmt->affected_rows;
      $stmt->close();
      if ($affected) echo json_encode(["success"=>true,"message"=>"Deleted"]);
      else bad(404, "Photo not found");
      break;
    }

    default: bad(405, "Method not allowed");
  }
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["success"=>false,"error"=>$e->getMessage()]);
}
@$conn->close();
