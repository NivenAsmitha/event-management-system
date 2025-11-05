<?php
// /api/events
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/db.php'; // provides $conn (mysqli)

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = strtok($_SERVER['REQUEST_URI'] ?? '', '?'); // drop query string

// --- uploads dir ---
$uploadsDir = __DIR__ . '/uploads/events';
$publicPrefix = '/uploads/events';
if (!is_dir($uploadsDir)) { @mkdir($uploadsDir, 0775, true); }

// ---------- helpers ----------
function bad($code, $msg) { http_response_code($code); echo json_encode(["success"=>false,"error"=>$msg]); exit; }

function parseIdFromUri($uri) {
  $parts = array_values(array_filter(explode('/', trim($uri, '/'))));
  if (!$parts) return null;
  $last = end($parts);
  return ctype_digit($last) ? (int)$last : null;
}

// normalize $_FILES entry for multi-field like images[]
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

// save multiple uploaded images from a given field name; returns array of public paths
function saveUploadedImages($fieldName) {
  global $uploadsDir, $publicPrefix;
  $saved = [];
  if (!isset($_FILES[$fieldName])) return $saved;
  $files = rearrayFiles($_FILES[$fieldName]);
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

// single legacy file handler for "image"
function saveSingleUpload($fieldName) {
  global $uploadsDir, $publicPrefix;
  if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) return null;
  $f = $_FILES[$fieldName];
  $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, ['jpg','jpeg','png','gif','webp'])) $ext = 'jpg';
  $name = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
  $dest = $uploadsDir . '/' . $name;
  if (!move_uploaded_file($f['tmp_name'], $dest)) return null;
  return $publicPrefix . '/' . $name;
}

// fetch images array for an event
function getEventImages(mysqli $conn, int $eventId): array {
  $imgs = [];
  if ($stmt = $conn->prepare("SELECT path FROM event_images WHERE event_id = ? ORDER BY sort_order, id")) {
    $stmt->bind_param("i", $eventId);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($r = $res->fetch_assoc()) $imgs[] = $r['path'];
    $stmt->close();
  }
  return $imgs;
}

// replace images for an event with given array (max 4)
function setEventImages(mysqli $conn, int $eventId, array $paths): void {
  // sanitize & cap
  $paths = array_values(array_filter($paths, fn($p) => is_string($p) && $p !== ''));
  $paths = array_slice(array_unique($paths), 0, 4);

  // transactional replace
  $conn->begin_transaction();
  try {
    if ($stmt = $conn->prepare("DELETE FROM event_images WHERE event_id = ?")) {
      $stmt->bind_param("i", $eventId);
      $stmt->execute();
      $stmt->close();
    }
    if ($paths) {
      if ($ins = $conn->prepare("INSERT INTO event_images (event_id, path, sort_order) VALUES (?, ?, ?)")) {
        foreach ($paths as $i => $p) {
          $ins->bind_param("isi", $eventId, $p, $i);
          $ins->execute();
        }
        $ins->close();
      }
    }
    // keep legacy primary image in events.image
    $primary = $paths[0] ?? null;
    if ($stmt = $conn->prepare("UPDATE events SET image = ? WHERE id = ?")) {
      $stmt->bind_param("si", $primary, $eventId);
      $stmt->execute();
      $stmt->close();
    }
    $conn->commit();
  } catch (\Throwable $e) {
    $conn->rollback();
    throw $e;
  }
}

$eventId = parseIdFromUri($uri);
$isMultipart = (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false);

try {
  switch ($method) {
    // ----------- READ -----------
    case 'GET':
      if ($eventId) {
        if (!($stmt = $conn->prepare("SELECT * FROM events WHERE id = ?"))) bad(500, "Prepare failed");
        $stmt->bind_param("i", $eventId);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();
        if (!$row) bad(404, "Event not found");

        $event = [
          "id" => (int)$row['id'],
          "title" => $row['title'],
          "category" => $row['category'],
          "date" => $row['date'],
          "time" => $row['time'],
          "location" => $row['location'],
          "price" => (float)$row['price'],
          "capacity" => (int)$row['capacity'],
          "registered" => (int)$row['registered'],
          "image" => $row['image'],
          "images" => getEventImages($conn, (int)$row['id']),
          "rating" => (float)$row['rating'],
          "ratingsCount" => (int)$row['ratingsCount']
        ];
        // if legacy image exists but images[] empty, surface it as first image
        if (!$event['images'] && $event['image']) $event['images'] = [$event['image']];
        echo json_encode(["success"=>true,"data"=>$event]);
      } else {
        $res = $conn->query("SELECT * FROM events ORDER BY date DESC, time DESC, id DESC");
        $out = [];
        while ($row = $res->fetch_assoc()) {
          $imgs = getEventImages($conn, (int)$row['id']);
          if (!$imgs && $row['image']) $imgs = [$row['image']];
          $out[] = [
            "id" => (int)$row['id'],
            "title" => $row['title'],
            "category" => $row['category'],
            "date" => $row['date'],
            "time" => $row['time'],
            "location" => $row['location'],
            "price" => (float)$row['price'],
            "capacity" => (int)$row['capacity'],
            "registered" => (int)$row['registered'],
            "image" => $row['image'],
            "images" => $imgs,
            "rating" => (float)$row['rating'],
            "ratingsCount" => (int)$row['ratingsCount']
          ];
        }
        echo json_encode(["success"=>true,"data"=>$out]);
      }
      break;

    // ----------- CREATE -----------
    case 'POST': {
      if ($isMultipart) {
        // fields
        $title = $_POST['title'] ?? '';
        $category = $_POST['category'] ?? '';
        $date = $_POST['date'] ?? '';
        $time = $_POST['time'] ?? '';
        $location = $_POST['location'] ?? '';
        $price = (float)($_POST['price'] ?? 0);
        $capacity = (int)($_POST['capacity'] ?? 0);
        $registered = (int)($_POST['registered'] ?? 0);
        $rating = (float)($_POST['rating'] ?? 0);
        $ratingsCount = (int)($_POST['ratingsCount'] ?? 0);

        // existing kept images (from client) + new uploads
        $kept = [];
        if (!empty($_POST['images_json'])) {
          $tmp = json_decode((string)$_POST['images_json'], true);
          if (is_array($tmp)) $kept = array_values(array_filter($tmp, 'strlen'));
        }
        $newMulti = saveUploadedImages('images'); // images[]
        $legacySingle = saveSingleUpload('image'); // image
        if ($legacySingle) array_unshift($newMulti, $legacySingle); // keep first as primary in order

        $all = array_slice(array_values(array_unique(array_merge($kept, $newMulti))), 0, 4);
        $primary = $all[0] ?? null;

      } else {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $title = $input['title'] ?? '';
        $category = $input['category'] ?? '';
        $date = $input['date'] ?? '';
        $time = $input['time'] ?? '';
        $location = $input['location'] ?? '';
        $price = (float)($input['price'] ?? 0);
        $capacity = (int)($input['capacity'] ?? 0);
        $registered = (int)($input['registered'] ?? 0);
        $rating = (float)($input['rating'] ?? 0);
        $ratingsCount = (int)($input['ratingsCount'] ?? 0);
        $imgsIn = is_array($input['images'] ?? null) ? $input['images'] : [];
        $all = array_slice($imgsIn, 0, 4);
        $primary = $all[0] ?? ($input['image'] ?? null);
      }

      if (!$title || !$date || !$time || !$location) bad(400, "Title, date, time, and location are required");

      // insert
      if (!($stmt = $conn->prepare("INSERT INTO events (title, category, date, time, location, price, capacity, registered, image, rating, ratingsCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")))
        bad(500, "Prepare failed");
      $stmt->bind_param("sssssdiisdi", $title, $category, $date, $time, $location, $price, $capacity, $registered, $primary, $rating, $ratingsCount);
      if (!$stmt->execute()) bad(500, "Failed to create event");
      $newId = $conn->insert_id;
      $stmt->close();

      // images table
      setEventImages($conn, (int)$newId, $all);

      // return row
      if (!($stmt = $conn->prepare("SELECT * FROM events WHERE id = ?"))) bad(500, "Prepare failed");
      $stmt->bind_param("i", $newId);
      $stmt->execute();
      $res = $stmt->get_result();
      $row = $res->fetch_assoc();
      $stmt->close();

      $event = [
        "id" => (int)$row['id'],
        "title" => $row['title'],
        "category" => $row['category'],
        "date" => $row['date'],
        "time" => $row['time'],
        "location" => $row['location'],
        "price" => (float)$row['price'],
        "capacity" => (int)$row['capacity'],
        "registered" => (int)$row['registered'],
        "image" => $row['image'],
        "images" => getEventImages($conn, (int)$row['id']),
        "rating" => (float)$row['rating'],
        "ratingsCount" => (int)$row['ratingsCount']
      ];
      echo json_encode(["success"=>true,"data"=>$event]);
      break;
    }

    // ----------- UPDATE -----------
    case 'PUT': {
      if (!$eventId) {
        $peek = json_decode(file_get_contents('php://input'), true);
        if (isset($peek['id'])) $eventId = (int)$peek['id'];
      }
      if (!$eventId) bad(400, "Event ID is required");

      if ($isMultipart) {
        $title = $_POST['title'] ?? '';
        $category = $_POST['category'] ?? '';
        $date = $_POST['date'] ?? '';
        $time = $_POST['time'] ?? '';
        $location = $_POST['location'] ?? '';
        $price = (float)($_POST['price'] ?? 0);
        $capacity = (int)($_POST['capacity'] ?? 0);
        $registered = (int)($_POST['registered'] ?? 0);
        $rating = (float)($_POST['rating'] ?? 0);
        $ratingsCount = (int)($_POST['ratingsCount'] ?? 0);

        $kept = [];
        if (!empty($_POST['images_json'])) {
          $tmp = json_decode((string)$_POST['images_json'], true);
          if (is_array($tmp)) $kept = array_values(array_filter($tmp, 'strlen'));
        }
        $newMulti = saveUploadedImages('images');
        $legacySingle = saveSingleUpload('image');
        if ($legacySingle) array_unshift($newMulti, $legacySingle);

        $all = array_slice(array_values(array_unique(array_merge($kept, $newMulti))), 0, 4);
        $primary = $all[0] ?? null;

      } else {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $title = $input['title'] ?? '';
        $category = $input['category'] ?? '';
        $date = $input['date'] ?? '';
        $time = $input['time'] ?? '';
        $location = $input['location'] ?? '';
        $price = (float)($input['price'] ?? 0);
        $capacity = (int)($input['capacity'] ?? 0);
        $registered = (int)($input['registered'] ?? 0);
        $rating = (float)($input['rating'] ?? 0);
        $ratingsCount = (int)($input['ratingsCount'] ?? 0);

        $imgsIn = $input['images'] ?? null; // may be null (no change) or array (replace)
        if (is_array($imgsIn)) {
          $all = array_slice($imgsIn, 0, 4);
          $primary = $all[0] ?? ($input['image'] ?? null);
        } else {
          // no images change requested
          $all = null; $primary = null;
        }
      }

      if (!$title || !$date || !$time || !$location)
        bad(400, "Title, date, time, and location are required");

      // build update; include primary image if changed
      if ($primary !== null) {
        $sql = "UPDATE events SET title=?, category=?, date=?, time=?, location=?, price=?, capacity=?, registered=?, image=?, rating=?, ratingsCount=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssdiisdii", $title, $category, $date, $time, $location, $price, $capacity, $registered, $primary, $rating, $ratingsCount, $eventId);
      } else {
        $sql = "UPDATE events SET title=?, category=?, date=?, time=?, location=?, price=?, capacity=?, registered=?, rating=?, ratingsCount=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssdiidii", $title, $category, $date, $time, $location, $price, $capacity, $registered, $rating, $ratingsCount, $eventId);
      }
      if (!$stmt->execute()) bad(500, "Failed to update event");
      $stmt->close();

      // replace images if requested/provided
      if ($all !== null) setEventImages($conn, $eventId, $all);

      // return updated row
      if (!($stmt = $conn->prepare("SELECT * FROM events WHERE id = ?"))) bad(500, "Prepare failed");
      $stmt->bind_param("i", $eventId);
      $stmt->execute();
      $res = $stmt->get_result();
      $row = $res->fetch_assoc();
      $stmt->close();
      if (!$row) bad(404, "Event not found");

      $event = [
        "id" => (int)$row['id'],
        "title" => $row['title'],
        "category" => $row['category'],
        "date" => $row['date'],
        "time" => $row['time'],
        "location" => $row['location'],
        "price" => (float)$row['price'],
        "capacity" => (int)$row['capacity'],
        "registered" => (int)$row['registered'],
        "image" => $row['image'],
        "images" => getEventImages($conn, (int)$row['id']),
        "rating" => (float)$row['rating'],
        "ratingsCount" => (int)$row['ratingsCount']
      ];
      echo json_encode(["success"=>true,"data"=>$event]);
      break;
    }

    // ----------- DELETE -----------
    case 'DELETE':
      if (!$eventId) bad(400, "Event ID is required");
      // if you created event_images with FK ON DELETE CASCADE, this cleans images too
      if (!($stmt = $conn->prepare("DELETE FROM events WHERE id = ?"))) bad(500, "Prepare failed");
      $stmt->bind_param("i", $eventId);
      if (!$stmt->execute()) bad(500, "Failed to delete event");
      $affected = $stmt->affected_rows;
      $stmt->close();
      if ($affected > 0) echo json_encode(["success"=>true,"message"=>"Event deleted successfully"]);
      else bad(404, "Event not found");
      break;

    default:
      bad(405, "Method not allowed");
  }
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["success"=>false,"error"=>$e->getMessage()]);
}

@$conn->close();
