<?php
// מפעיל או מכבה חוק אוטומציה ושומר את הבחירה לכל המנהלים
if ($action === "automation-save") {
    $currentUser = admin();
    $id = (string) ($data["id"] ?? "");
    $enabled = !empty($data["enabled"]) ? 1 : 0;
    $query = db()->prepare("UPDATE automation_rules SET enabled=?,updated_by=? WHERE id=?");
    $query->execute([$enabled,$currentUser["id"],$id]);
    if (!$query->rowCount()) out(["error" => "חוק האוטומציה לא נמצא"], 404);
    log_activity("עדכון אוטומציה", ($enabled ? "הופעל " : "כובה ") . $id);
    out(["ok" => true]);
}
