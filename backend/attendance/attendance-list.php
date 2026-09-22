<?php
// מחזיר רישומי נוכחות; מנהל רואה את כולם ועובד רואה רק את עצמו
if ($action === "attendance-list") {
    $u = user();
    $sql =
        "SELECT a.*,u.full_name,ROUND(IF(a.clock_out IS NULL,0,TIMESTAMPDIFF(SECOND,a.clock_in,a.clock_out)/3600),2) hours FROM attendance a JOIN users u ON u.id=a.user_id";
    $args = [];
    if ($u["role"] !== "admin") {
        $sql .= " WHERE a.user_id=?";
        $args[] = $u["id"];
    }
    $sql .= " ORDER BY a.clock_in DESC";
    $q = db()->prepare($sql);
    $q->execute($args);
    out(["items" => $q->fetchAll()]);
}
