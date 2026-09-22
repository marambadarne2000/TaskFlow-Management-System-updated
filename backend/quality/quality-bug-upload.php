<?php
// מצרף צילום מסך לבאג לאחר בדיקת הרשאה, תוכן וגודל
if ($action === "quality-bug-upload") {
    $currentUser = user();
    $bugId = (int) ($_POST["bug_id"] ?? 0);
    $query = db()->prepare("SELECT project_id,reported_by,assigned_to FROM qa_bugs WHERE id=?");
    $query->execute([$bugId]);
    $bug = $query->fetch();
    if (!$bug) out(["error" => "הבאג לא נמצא"], 404);
    $allowed = $currentUser["role"] === "admin" || (int) $bug["reported_by"] === (int) $currentUser["id"] || (int) $bug["assigned_to"] === (int) $currentUser["id"];
    if (!$allowed || empty($_FILES["file"])) out(["error" => "אין הרשאה לצרף צילום מסך"], 403);

    $file = $_FILES["file"];
    [$extension] = validate_upload($file, ["png" => ["image/png"], "jpg" => ["image/jpeg"], "jpeg" => ["image/jpeg"], "webp" => ["image/webp"]], 5 * 1024 * 1024);
    $folder = __DIR__ . "/uploads";
    if (!is_dir($folder)) mkdir($folder, 0775, true);
    $savedName = bin2hex(random_bytes(10)) . "." . $extension;
    if (!move_uploaded_file($file["tmp_name"], $folder . "/" . $savedName)) out(["error" => "שמירת צילום המסך נכשלה"], 500);
    $originalName = safe_original_name($file["name"]);
    $query = db()->prepare("UPDATE qa_bugs SET screenshot_name=?,screenshot_path=? WHERE id=?");
    $query->execute([$originalName,$savedName,$bugId]);
    log_activity("צילום מסך לבאג", "צורף צילום מסך לבאג מספר " . $bugId);
    out(["ok" => true, "file_name" => $originalName]);
}
