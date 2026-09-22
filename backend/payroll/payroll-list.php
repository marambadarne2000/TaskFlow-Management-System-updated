<?php
// מחזיר תלושים; מנהל יכול לראות את כולם ועובד רואה רק את התלושים שלו
if ($action === "payroll-list") {
    $u = user();
    $sql =
        "SELECT p.*,u.full_name FROM payroll p JOIN users u ON u.id=p.user_id";
    $args = [];
    if ($u["role"] !== "admin" || isset($_GET["user_id"])) {
        $id = $u["role"] === "admin" ? (int) $_GET["user_id"] : (int) $u["id"];
        $sql .= " WHERE p.user_id=?";
        $args[] = $id;
    }
    $sql .= " ORDER BY p.pay_month DESC";
    $q = db()->prepare($sql);
    $q->execute($args);
    out(["items" => $q->fetchAll()]);
}
