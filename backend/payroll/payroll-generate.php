<?php
// מחשב שעות ושכר לחודש, שומר תלוש ושולח התראה לעובד
if ($action === "payroll-generate") {
    // הפקת תלוש היא פעולה שמותרת למנהל בלבד
    admin();
    $id = (int) $data["user_id"];
    $month = (string) $data["pay_month"];
    if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
        out(["error" => "חודש לא תקין"], 422);
    }
    // חיבור שעות כל המשמרות הסגורות של העובד בחודש שנבחר
    $q = db()->prepare(
        "SELECT u.hourly_rate,COALESCE(SUM(TIMESTAMPDIFF(SECOND,a.clock_in,a.clock_out))/3600,0) hours FROM users u LEFT JOIN attendance a ON a.user_id=u.id AND a.clock_out IS NOT NULL AND DATE_FORMAT(a.clock_in,'%Y-%m')=? WHERE u.id=? GROUP BY u.id",
    );
    $q->execute([$month, $id]);
    $p = $q->fetch();
    if (!$p) {
        out(["error" => "עובד לא נמצא"], 404);
    }
    // שכר ברוטו מחושב לפי סך השעות כפול התעריף לשעה
    $total = round((float) $p["hours"] * (float) $p["hourly_rate"], 2);
    // אם כבר קיים תלוש לאותו עובד וחודש, הנתונים שלו מתעדכנים
    $q = db()->prepare(
        "INSERT INTO payroll(user_id,pay_month,total_hours,hourly_rate,total_salary) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE total_hours=VALUES(total_hours),hourly_rate=VALUES(hourly_rate),total_salary=VALUES(total_salary),created_at=NOW()",
    );
    $q->execute([$id, $month, $p["hours"], $p["hourly_rate"], $total]);
    // לאחר הפקת התלוש העובד מקבל התראה אוטומטית
    $q = db()->prepare(
        "INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)",
    );
    $q->execute([
        $id,
        "תלוש שכר חדש",
        "תלוש השכר לחודש " . $month . " זמין לצפייה החל מה-9 בחודש",
    ]);
    log_activity(
        "הפקת תלוש",
        "הופק תלוש לחודש " . $month . " לעובד מספר " . $id,
    );
    out(["ok" => true, "total_salary" => $total]);
}
