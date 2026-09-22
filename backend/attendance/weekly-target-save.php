<?php
// שומר או מעדכן מכסת שעות של עובד לשבוע מסוים פעולה זו מותרת למנהל בלבד
if ($action === "weekly-target-save") {
    admin();
    $userId = (int) ($data["user_id"] ?? 0);
    $weekStart = trim($data["week_start"] ?? "");
    $targetHours = (float) ($data["target_hours"] ?? -1);

    // בדיקה פשוטה מונעת שמירת עובד, תאריך או מספר שעות לא תקינים
    if ($userId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStart)) {
        out(["error" => "יש לבחור עובד ושבוע תקינים"], 422);
    }
    if ($targetHours < 0 || $targetHours > 168) {
        out(["error" => "מכסת השעות חייבת להיות בין 0 ל־168"], 422);
    }

 // מנגנון עדכון רשומה קיימת מעדכן את הרשומה אם כבר קיימת מכסה לאותו עובד ולאותו שבוע
    $query = db()->prepare(
        "INSERT INTO weekly_work_targets(user_id,week_start,target_hours)
         VALUES(?,?,?)
         ON DUPLICATE KEY UPDATE target_hours=VALUES(target_hours)",
    );
    $query->execute([$userId, $weekStart, $targetHours]);
    log_activity("עדכון מכסת שעות", "עודכנה מכסה שבועית לעובד מספר " . $userId);
    out(["ok" => true]);
}
