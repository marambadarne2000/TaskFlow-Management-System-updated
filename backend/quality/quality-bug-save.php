<?php
// משתמש בפרויקט מדווח באג עם שלבי שחזור וחומרה
if ($action === "quality-bug-save") {
    $currentUser = user();
    $projectId = (int) ($data["project_id"] ?? 0);
    $title = trim((string) ($data["title"] ?? ""));
    $description = trim((string) ($data["description"] ?? ""));
    $steps = trim((string) ($data["reproduction_steps"] ?? ""));
    $severity = (string) ($data["severity"] ?? "medium");
    if (!$projectId || !$title || !$description || !$steps || !in_array($severity, ["low","medium","high","critical"], true)) out(["error" => "יש למלא את כל פרטי הבאג"], 422);
    if ($currentUser["role"] !== "admin") {
        $access = db()->prepare("SELECT 1 FROM tasks WHERE project_id=? AND assignee_id=? LIMIT 1");
        $access->execute([$projectId,$currentUser["id"]]);
        if (!$access->fetchColumn()) out(["error" => "אין הרשאה לדווח בפרויקט"], 403);
    }
    $pdo = db();
    $assignedTo = (int) ($data["assigned_to"] ?? 0) ?: null;
    if ($assignedTo) {
        $employee = $pdo->prepare("SELECT 1 FROM users WHERE id=? AND role='employee' AND status='active'");
        $employee->execute([$assignedTo]);
        if (!$employee->fetchColumn()) out(["error" => "ניתן להקצות באג רק לעובד פעיל"], 422);
    }
    $query = $pdo->prepare("INSERT INTO qa_bugs(project_id,task_id,title,description,reproduction_steps,severity,reported_by,assigned_to) VALUES(?,?,?,?,?,?,?,?)");
    $query->execute([$projectId,(int) ($data["task_id"] ?? 0) ?: null,$title,$description,$steps,$severity,$currentUser["id"],$assignedTo]);
    $id = (int) $pdo->lastInsertId();
    if ($assignedTo) {
        $notice = $pdo->prepare("INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)");
        $notice->execute([$assignedTo,"באג חדש לטיפול","הוקצה אליך הבאג: " . $title]);
    }
    log_activity("דיווח באג", "דווח באג מספר " . $id . ": " . $title);
    out(["ok" => true, "id" => $id]);
}
