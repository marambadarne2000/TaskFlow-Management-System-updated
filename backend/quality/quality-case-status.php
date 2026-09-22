<?php
// חבר פרויקט מריץ בדיקה ומעדכן את התוצאה
if ($action === "quality-case-status") {
    $currentUser = user();
    $id = (int) ($data["id"] ?? 0);
    $status = (string) ($data["status"] ?? "");
    if (!in_array($status, ["ready","passed","failed","blocked"], true)) out(["error" => "תוצאת בדיקה אינה תקינה"], 422);
    $query = db()->prepare("SELECT project_id,title,assigned_to FROM qa_test_cases WHERE id=?");
    $query->execute([$id]);
    $testCase = $query->fetch();
    if (!$testCase) out(["error" => "תרחיש הבדיקה לא נמצא"], 404);
    if ($currentUser["role"] !== "admin" && (int) $testCase["assigned_to"] !== (int) $currentUser["id"]) out(["error" => "רק העובד שהוקצה לבדיקה יכול לעדכן אותה"], 403);
    $query = db()->prepare("UPDATE qa_test_cases SET status=?,last_run_at=NOW() WHERE id=?");
    $query->execute([$status,$id]);
    $projectState = automation_enabled("complete") ? sync_project_completion((int) $testCase["project_id"]) : ["complete"=>false,"quality"=>project_quality_gate((int) $testCase["project_id"])];
    log_activity("הרצת בדיקה", "תרחיש " . $testCase["title"] . " עודכן ל-" . $status);
    out(["ok" => true, "project_completed" => $projectState["complete"], "quality_gate" => $projectState["quality"]]);
}
