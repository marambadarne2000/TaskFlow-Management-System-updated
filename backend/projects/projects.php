<?php
// מחזיר פרויקטים; מנהל רואה הכל ועובד רואה רק פרויקטים שבהם הוא חבר
if ($action === "projects" && $_SERVER["REQUEST_METHOD"] === "GET") {
    $u = user();
    $sql =
        "SELECT p.*,COUNT(t.id) total_tasks,COALESCE(SUM(t.status='done'),0) done_tasks FROM projects p LEFT JOIN tasks t ON t.project_id=p.id";
    $args = [];
    if ($u["role"] !== "admin") {
        $sql .=
            " WHERE EXISTS(SELECT 1 FROM tasks x WHERE x.project_id=p.id AND x.assignee_id=?)";
        $args[] = $u["id"];
    }
    $sql .= " GROUP BY p.id ORDER BY p.created_at DESC";
    $q = db()->prepare($sql);
    $q->execute($args);
    $items = $q->fetchAll();
    $milestones = db()->query("SELECT * FROM project_milestones ORDER BY due_date,id")->fetchAll();
    out(["items" => $items, "milestones" => $milestones]);
}
