<?php
// מוסיף זמן עבודה למשימה ושומר גם רישום מפורט לבקרה
if ($action === "task-log-time") {
    $user = user();
    $taskId = (int) ($data["task_id"] ?? 0);
    $minutes = (int) ($data["minutes"] ?? 0);
    $note = trim((string) ($data["note"] ?? ""));
    if ($taskId <= 0 || $minutes <= 0 || $minutes > 1440) out(["error" => "זמן העבודה אינו תקין"], 422);
    $pdo = db();
    $query = $pdo->prepare("SELECT assignee_id FROM tasks WHERE id=?");
    $query->execute([$taskId]);
    $assigneeId = (int) $query->fetchColumn();
    if (!$assigneeId || ($user["role"] !== "admin" && $assigneeId !== (int) $user["id"])) out(["error" => "אין הרשאה לעדכן את המשימה"], 403);
    $pdo->beginTransaction();
    $query = $pdo->prepare("INSERT INTO task_work_logs(task_id,user_id,minutes,note) VALUES(?,?,?,?)");
    $query->execute([$taskId, $user["id"], $minutes, $note ?: null]);
    $query = $pdo->prepare("UPDATE tasks SET actual_minutes=actual_minutes+? WHERE id=?");
    $query->execute([$minutes, $taskId]);
    $pdo->commit();
    log_activity("דיווח זמן", "נוספו " . $minutes . " דקות למשימה מספר " . $taskId);
    out(["ok" => true]);
}
