<?php
// חוסם או מפעיל משתמש ושומר את מועד החסימה
if ($action === "user-status") {
    $manager = admin();
    $id = (int) ($data["user_id"] ?? 0);
    $status = (string) ($data["status"] ?? "");
    if (!in_array($status, ["active", "blocked"], true)) {
        out(["error" => "סטטוס לא תקין"], 422);
    }
    if ($id === (int) $manager["id"]) {
        out(["error" => "מנהל אינו יכול לחסום את עצמו"], 422);
    }
    $q = db()->prepare(
        "UPDATE users SET status=?, blocked_at=IF(?='blocked',NOW(),NULL) WHERE id=?",
    );
    $q->execute([$status, $status, $id]);
    log_activity("שינוי סטטוס משתמש", "סטטוס משתמש מספר " . $id . " שונה ל-" . $status);
    out(["ok" => true]);
}
