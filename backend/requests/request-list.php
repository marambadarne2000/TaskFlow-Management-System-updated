<?php
// מחזיר לעובד את בקשותיו ולמנהל את הבקשות שנשלחו אליו
if ($action === "request-list") {
    $currentUser = user();
    $column = $currentUser["role"] === "admin" ? "r.manager_id" : "r.employee_id";
    $query = db()->prepare(
        "SELECT r.*,e.full_name employee_name,m.full_name manager_name,
                t.title task_title,st.title swap_task_title
         FROM employee_requests r
         JOIN users e ON e.id=r.employee_id
         JOIN users m ON m.id=r.manager_id
         LEFT JOIN tasks t ON t.id=r.task_id
         LEFT JOIN tasks st ON st.id=r.swap_task_id
         WHERE $column=?
         ORDER BY r.created_at DESC",
    );
    $query->execute([$currentUser["id"]]);
    out(["items" => $query->fetchAll()]);
}
