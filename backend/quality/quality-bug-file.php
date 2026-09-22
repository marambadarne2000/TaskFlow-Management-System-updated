<?php
// מציג צילום מסך של באג רק למשתמש בעל הרשאה לפרויקט או לבאג
if ($action === "quality-bug-file") {
    $currentUser = user();
    $bugId = (int) ($_GET["id"] ?? 0);
    $query = db()->prepare("SELECT project_id,reported_by,assigned_to,screenshot_name,screenshot_path FROM qa_bugs WHERE id=? AND screenshot_path IS NOT NULL");
    $query->execute([$bugId]);
    $bug = $query->fetch();
    if (!$bug) out(["error" => "צילום המסך לא נמצא"], 404);
    $allowed = $currentUser["role"] === "admin" || (int) $bug["reported_by"] === (int) $currentUser["id"] || (int) $bug["assigned_to"] === (int) $currentUser["id"];
    if (!$allowed) {
        $access = db()->prepare("SELECT 1 FROM tasks WHERE project_id=? AND assignee_id=? LIMIT 1");
        $access->execute([$bug["project_id"],$currentUser["id"]]);
        $allowed = (bool) $access->fetchColumn();
    }
    if (!$allowed) out(["error" => "אין הרשאה לצילום המסך"], 403);
    $path = __DIR__ . "/uploads/" . basename($bug["screenshot_path"]);
    if (!is_file($path)) out(["error" => "צילום המסך לא נמצא"], 404);
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
    header_remove("Content-Type");
    header("X-Content-Type-Options: nosniff");
    header("Content-Security-Policy: default-src 'none'; sandbox");
    header("Content-Type: " . $mime);
    header("Content-Disposition: inline; filename*=UTF-8''" . rawurlencode($bug["screenshot_name"]));
    readfile($path);
    exit();
}
