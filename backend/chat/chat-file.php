<?php
// מציג או מוריד קובץ רק לאחר בדיקת הרשאה לחדר הצ׳אט
if ($action === "chat-file") {
    $currentUser = user();
    $messageId = (int) ($_GET["id"] ?? 0);
    $query = db()->prepare(
        "SELECT project_id,manager_id,file_name,file_path FROM project_messages WHERE id=? AND file_path IS NOT NULL",
    );
    $query->execute([$messageId]);
    $message = $query->fetch();
    if (!$message) {
        out(["error" => "הקובץ לא נמצא"], 404);
    }

    $allowed = (int) $message["manager_id"] === (int) $currentUser["id"];
    if (!$allowed && $currentUser["role"] !== "admin") {
        $query = db()->prepare(
            "SELECT 1 FROM tasks WHERE project_id=? AND assignee_id=? LIMIT 1",
        );
        $query->execute([$message["project_id"], $currentUser["id"]]);
        $allowed = (bool) $query->fetchColumn();
    }
    if (!$allowed) {
        out(["error" => "אין הרשאה לקובץ"], 403);
    }

    $path = __DIR__ . "/uploads/" . basename($message["file_path"]);
    if (!is_file($path)) {
        out(["error" => "הקובץ לא נמצא"], 404);
    }

    $extension = strtolower(pathinfo($message["file_name"], PATHINFO_EXTENSION));
    $previewTypes = [
        "pdf" => "application/pdf",
        "png" => "image/png",
        "jpg" => "image/jpeg",
        "jpeg" => "image/jpeg",
        "txt" => "text/plain; charset=utf-8",
    ];
    $preview = ($_GET["preview"] ?? "0") === "1" && isset($previewTypes[$extension]);

    header_remove("Content-Type");
    header("X-Content-Type-Options: nosniff");
    header("Content-Security-Policy: default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
    header("Content-Type: " . ($preview ? $previewTypes[$extension] : "application/octet-stream"));
    header("Content-Disposition: " . ($preview ? "inline" : "attachment") . "; filename*=UTF-8''" . rawurlencode($message["file_name"]));
    header("Content-Length: " . filesize($path));
    readfile($path);
    exit();
}
