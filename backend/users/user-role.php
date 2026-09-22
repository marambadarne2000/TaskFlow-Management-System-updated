<?php
// משנה תפקיד בין עובד למנהל לאחר בדיקת הרשאת מנהל
if ($action === "user-role") {
    $manager = admin();
    $id = (int) ($data["user_id"] ?? 0);
    $role = (string) ($data["role"] ?? "");
    if (!in_array($role, ["admin", "employee"], true)) {
        out(["error" => "תפקיד לא תקין"], 422);
    }
    if ($id === (int) $manager["id"]) {
        out(["error" => "מנהל אינו יכול לשנות את התפקיד של עצמו"], 422);
    }
    $q = db()->prepare("UPDATE users SET role=? WHERE id=?");
    $q->execute([$role, $id]);
    if (!$q->rowCount()) {
        out(["error" => "המשתמש לא נמצא או שהתפקיד כבר מעודכן"], 404);
    }
    log_activity("שינוי תפקיד", "תפקיד משתמש מספר " . $id . " שונה ל-" . $role);
    out(["ok" => true]);
}
