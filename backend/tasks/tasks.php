<?php
// מחזיר משימות; עובד מקבל את משימות פרויקטי הצוות אך הממשק מסנן את משימותיו
if ($action === "tasks" && $_SERVER["REQUEST_METHOD"] === "GET") {
    $u = user();
    $sql =
        "SELECT t.*,p.name project_name,u.full_name worker_name FROM tasks t JOIN projects p ON p.id=t.project_id LEFT JOIN users u ON u.id=t.assignee_id";
    $args = [];
    if ($u["role"] !== "admin") {
        // עובד מקבל את משימות כל הפרויקטים שבהם הוא חבר
 // בצד הממשק הרשימה "המשימות שלי" עדיין מסננת רק את המשימות שלו
        $sql .= " WHERE EXISTS (
                SELECT 1
                FROM tasks my_task
                WHERE my_task.project_id=t.project_id
                  AND my_task.assignee_id=?
            )";
        $args[] = $u["id"];
    }
    $q = db()->prepare($sql);
    $q->execute($args);
    out(["items" => $q->fetchAll()]);
}
