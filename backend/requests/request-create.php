<?php
// יוצר בקשה חדשה של עובד ושולח התראה למנהל שנבחר
if ($action === "request-create") {
    $currentUser = user();
    if ($currentUser["role"] !== "employee") {
        out(["error" => "רק עובד יכול ליצור בקשה"], 403);
    }

    $managerId = (int) ($data["manager_id"] ?? 0);
    $type = (string) ($data["request_type"] ?? "");
    $reason = trim((string) ($data["reason"] ?? ""));
    $allowedTypes = ["vacation", "task_swap", "deadline", "late_arrival", "general"];
    if (!in_array($type, $allowedTypes, true) || $reason === "") {
        out(["error" => "יש לבחור סוג בקשה ולכתוב סיבה"], 422);
    }

    $query = db()->prepare(
        "SELECT 1 FROM users WHERE id=? AND role='admin' AND status='active'",
    );
    $query->execute([$managerId]);
    if (!$query->fetchColumn()) {
        out(["error" => "המנהל שנבחר אינו פעיל"], 422);
    }

    $taskId = (int) ($data["task_id"] ?? 0) ?: null;
    $swapTaskId = (int) ($data["swap_task_id"] ?? 0) ?: null;
    $startDate = $data["start_date"] ?? null;
    $endDate = $data["end_date"] ?? null;
    $requestedDueDate = $data["requested_due_date"] ?? null;

    if ($type === "vacation" && (!$startDate || !$endDate || $endDate < $startDate)) {
        out(["error" => "יש לבחור טווח חופשה תקין"], 422);
    }
    if ($type === "deadline" && (!$taskId || !$requestedDueDate)) {
        out(["error" => "יש לבחור משימה ותאריך הגשה חדש"], 422);
    }
    if ($type === "late_arrival" && !$startDate) {
        out(["error" => "יש לבחור את יום האיחור"], 422);
    }
    if ($type === "task_swap" && (!$taskId || !$swapTaskId || $taskId === $swapTaskId)) {
        out(["error" => "יש לבחור שתי משימות שונות"], 422);
    }

    if ($taskId) {
        $query = db()->prepare("SELECT project_id FROM tasks WHERE id=? AND assignee_id=?");
        $query->execute([$taskId, $currentUser["id"]]);
        $projectId = $query->fetchColumn();
        if (!$projectId) {
            out(["error" => "המשימה שנבחרה אינה שייכת לך"], 403);
        }
        if ($swapTaskId) {
            $query = db()->prepare(
                "SELECT 1 FROM tasks WHERE id=? AND project_id=? AND assignee_id<>?",
            );
            $query->execute([$swapTaskId, $projectId, $currentUser["id"]]);
            if (!$query->fetchColumn()) {
                out(["error" => "משימת ההחלפה חייבת להיות של חבר באותו פרויקט"], 422);
            }
        }
    }

    $query = db()->prepare(
        "INSERT INTO employee_requests(employee_id,manager_id,request_type,task_id,swap_task_id,start_date,end_date,requested_due_date,reason)
         VALUES(?,?,?,?,?,?,?,?,?)",
    );
    $query->execute([
        $currentUser["id"],
        $managerId,
        $type,
        $taskId,
        $swapTaskId,
        $startDate ?: null,
        $endDate ?: null,
        $requestedDueDate ?: null,
        $reason,
    ]);
    $requestId = (int) db()->lastInsertId();

    $query = db()->prepare(
        "INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)",
    );
    $query->execute([$managerId, "בקשה חדשה מעובד", "התקבלה בקשה חדשה מספר " . $requestId]);
    log_activity("יצירת בקשה", "נוצרה בקשה מספר " . $requestId . " מסוג " . $type);
    out(["ok" => true, "id" => $requestId]);
}
