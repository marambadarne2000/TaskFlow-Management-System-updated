<?php
// מסמן התראה של המשתמש המחובר כנקראה ושומר את זמן הקריאה
if ($action === "notification-read") {
    $u = user();
    $q = db()->prepare(
        "UPDATE notifications SET is_read=1,read_at=NOW() WHERE id=? AND user_id=?",
    );
    $q->execute([$data["id"], $u["id"]]);
    if ($q->rowCount()) log_activity("קריאת התראה", "התראה מספר " . (int) $data["id"] . " סומנה כנקראה");
    out(["ok" => true]);
}
