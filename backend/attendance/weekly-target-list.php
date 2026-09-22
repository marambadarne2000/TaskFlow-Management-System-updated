<?php
// מחזיר את מכסות השעות השבועיות מנהל רואה את כולם ועובד רואה רק את המכסות שלו
if ($action === "weekly-target-list") {
    $currentUser = user();
    $sql = "SELECT id,user_id,week_start,target_hours FROM weekly_work_targets";
    $values = [];

    if ($currentUser["role"] !== "admin") {
        $sql .= " WHERE user_id=?";
        $values[] = $currentUser["id"];
    }

    $sql .= " ORDER BY week_start DESC";
    $query = db()->prepare($sql);
    $query->execute($values);
    out(["items" => $query->fetchAll()]);
}
