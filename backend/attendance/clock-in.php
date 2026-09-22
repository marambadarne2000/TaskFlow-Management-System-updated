<?php
// פותח משמרת חדשה למשתמש המחובר ושומר את שעת הכניסה
if ($action === "clock-in") {
    $u = user();
    $q = db()->prepare(
        "SELECT id FROM attendance WHERE user_id=? AND clock_out IS NULL",
    );
    $q->execute([$u["id"]]);
    if ($q->fetch()) {
        out(["error" => "קיימת כניסה פתוחה"], 409);
    }
    $q = db()->prepare(
        "INSERT INTO attendance(user_id,clock_in) VALUES(?,NOW())",
    );
    $q->execute([$u["id"]]);
    log_activity("כניסה לנוכחות", "העובד התחיל משמרת");
    out(["ok" => true]);
}
