<?php
// יוצר אבן דרך או מעדכן את מצב אבן הדרך הקיימת
if ($action === "milestone-save") {
    admin();
    $id = (int) ($data["id"] ?? 0);
    $projectId = (int) ($data["project_id"] ?? 0);
    $title = trim((string) ($data["title"] ?? ""));
    $dueDate = (string) ($data["due_date"] ?? "");
    $status = ($data["status"] ?? "pending") === "completed" ? "completed" : "pending";
    if ($id) {
        $query = db()->prepare("UPDATE project_milestones SET title=?,due_date=?,status=? WHERE id=?");
        $query->execute([$title, $dueDate, $status, $id]);
    } else {
        if (!$projectId || !$title || !$dueDate) out(["error" => "יש למלא את כל פרטי אבן הדרך"], 422);
        $query = db()->prepare("INSERT INTO project_milestones(project_id,title,due_date,status) VALUES(?,?,?,?)");
        $query->execute([$projectId, $title, $dueDate, $status]);
        $id = (int) db()->lastInsertId();
    }
    log_activity($data["id"] ?? 0 ? "עדכון אבן דרך" : "יצירת אבן דרך", "אבן דרך: " . $title);
    out(["ok" => true, "id" => $id]);
}
