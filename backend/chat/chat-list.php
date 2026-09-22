<?php
// מחזיר הודעות של חדר צאט לפי פרויקט ומנהל לאחר בדיקת חברות בצוות
if ($action === "chat-list") {
    $u = user();
    $projectId = (int) ($_GET["project_id"] ?? 0);
    $managerId =
        $u["role"] === "admin"
            ? (int) $u["id"]
            : (int) ($_GET["manager_id"] ?? 0);
    if ($u["role"] !== "admin") {
        $q = db()->prepare(
            "SELECT 1 FROM tasks WHERE project_id=? AND assignee_id=? LIMIT 1",
        );
        $q->execute([$projectId, $u["id"]]);
        if (!$q->fetchColumn()) {
            out(["error" => "אינך חבר/ה בצוות הפרויקט"], 403);
        }
    }
    $q = db()->prepare(
        "SELECT m.id,m.project_id,m.manager_id,m.user_id,m.message,m.file_name,m.file_path,m.created_at,u.full_name FROM project_messages m JOIN users u ON u.id=m.user_id WHERE m.project_id=? AND m.manager_id=? ORDER BY m.created_at",
    );
    $q->execute([$projectId, $managerId]);
    out(["items" => $q->fetchAll()]);
}
