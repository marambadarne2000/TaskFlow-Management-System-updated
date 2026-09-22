<?php
// סוגר את המשמרת הפעילה ושומר את שעת היציאה
if ($action === "clock-out") {
    $u = user();
    $q = db()->prepare(
        "UPDATE attendance SET clock_out=NOW() WHERE user_id=? AND clock_out IS NULL ORDER BY id DESC LIMIT 1",
    );
    $q->execute([$u["id"]]);
    if (!$q->rowCount()) {
        out(["error" => "לא נמצאה כניסה פתוחה"], 409);
    }
    log_activity("יציאה מנוכחות", "העובד סיים משמרת");
    out(["ok" => true]);
}
