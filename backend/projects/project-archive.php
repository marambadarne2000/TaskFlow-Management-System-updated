<?php
// מעביר פרויקט לארכיון או מחזיר אותו בלי למחוק מידע
if ($action === "project-archive") {
    admin();
    $id = (int) ($data["id"] ?? 0);
    $archived = !empty($data["archived"]);
    $query = db()->prepare("UPDATE projects SET archived_at=IF(?,NOW(),NULL) WHERE id=?");
    $query->execute([$archived ? 1 : 0, $id]);
    if (!$query->rowCount()) out(["error" => "הפרויקט לא נמצא"], 404);
    log_activity($archived ? "ארכוב פרויקט" : "שחזור פרויקט", "פרויקט מספר " . $id);
    out(["ok" => true]);
}
