<?php
// מחזיר עובדים; מנהל רואה את כולם ועובד מקבל רק מנהלים וחברי צוות רלוונטיים
if ($action === "users") {
    $currentUser = user();
    $sql = "SELECT u.id,u.full_name,u.email,u.role,u.status,u.phone,u.hourly_rate,
                   u.max_active_tasks,u.cv_file,u.created_at,u.blocked_at,
                   (SELECT COUNT(*) FROM tasks active_task
                    WHERE active_task.assignee_id=u.id
                      AND active_task.status!='done') active_tasks
            FROM users u";
    $args = [];

    // מנהל רואה את כולם עובד מקבל רק את עצמו, חברי הצוות ומנהלי הפרויקטים שלו
    if ($currentUser["role"] !== "admin") {
        $sql .= " WHERE u.id=?
                  OR EXISTS (
                    SELECT 1 FROM tasks member_task
                    WHERE member_task.assignee_id=u.id
                      AND member_task.project_id IN (
                        SELECT my_task.project_id FROM tasks my_task
                        WHERE my_task.assignee_id=?
                      )
                  )
                  OR EXISTS (
                    SELECT 1 FROM projects managed_project
                    WHERE managed_project.created_by=u.id
                      AND managed_project.id IN (
                        SELECT my_project_task.project_id FROM tasks my_project_task
                        WHERE my_project_task.assignee_id=?
                      )
                  )";
        $args = [$currentUser["id"], $currentUser["id"], $currentUser["id"]];
    }

    $sql .= " ORDER BY u.created_at DESC";
    $query = db()->prepare($sql);
    $query->execute($args);
    out(["items" => $query->fetchAll()]);
}
