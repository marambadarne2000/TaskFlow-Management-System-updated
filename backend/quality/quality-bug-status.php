<?php
// מעדכן את מחזור החיים של באג לאחר בדיקת הרשאה
if ($action === "quality-bug-status") {
    $currentUser = user();
    $id = (int) ($data["id"] ?? 0);
    $status = (string) ($data["status"] ?? "");
    if (!in_array($status, ["open","in_progress","resolved","closed"], true)) out(["error" => "סטטוס באג אינו תקין"], 422);
    $query = db()->prepare("SELECT project_id,title,assigned_to FROM qa_bugs WHERE id=?");
    $query->execute([$id]);
    $bug = $query->fetch();
    if (!$bug) out(["error" => "הבאג לא נמצא"], 404);
    if ($currentUser["role"] !== "admin" && (int) $bug["assigned_to"] !== (int) $currentUser["id"]) out(["error" => "אין הרשאה לעדכן את הבאג"], 403);
    $query = db()->prepare("UPDATE qa_bugs SET status=? WHERE id=?");
    $query->execute([$status,$id]);
    $projectState = automation_enabled("complete") ? sync_project_completion((int) $bug["project_id"]) : ["complete"=>false,"quality"=>project_quality_gate((int) $bug["project_id"])];
    log_activity("עדכון באג", "הבאג " . $bug["title"] . " עודכן ל-" . $status);
    out(["ok" => true, "project_completed" => $projectState["complete"], "quality_gate" => $projectState["quality"]]);
}
