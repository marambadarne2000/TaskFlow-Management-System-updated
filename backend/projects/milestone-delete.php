<?php
// מוחק אבן דרך אחת לאחר בדיקת הרשאת מנהל
if ($action === "milestone-delete") {
    admin();
    $query = db()->prepare("DELETE FROM project_milestones WHERE id=?");
    $query->execute([(int) ($data["id"] ?? 0)]);
    log_activity("מחיקת אבן דרך", "נמחקה אבן דרך מספר " . (int) ($data["id"] ?? 0));
    out(["ok" => true]);
}
