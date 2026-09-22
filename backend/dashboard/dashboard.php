<?php
// מחזיר נתוני סיכום לדשבורד לפי הרשאת מנהל או עובד
if ($action === "dashboard") {
    $u = user();
    $pdo = db();
    if ($u["role"] === "admin") {
        out([
            "projects" => (int) $pdo
                ->query("SELECT COUNT(*) FROM projects")
                ->fetchColumn(),
            "completed" => (int) $pdo
                ->query(
                    "SELECT COUNT(*) FROM projects WHERE status='completed'",
                )
                ->fetchColumn(),
            "active_tasks" => (int) $pdo
                ->query("SELECT COUNT(*) FROM tasks WHERE status!='done'")
                ->fetchColumn(),
            "employees" => (int) $pdo
                ->query("SELECT COUNT(*) FROM users WHERE status='active'")
                ->fetchColumn(),
        ]);
    }
    $q = $pdo->prepare(
        "SELECT COUNT(*) total,SUM(status='done') done,SUM(status!='done') active FROM tasks WHERE assignee_id=?",
    );
    $q->execute([$u["id"]]);
    out($q->fetch());
}
