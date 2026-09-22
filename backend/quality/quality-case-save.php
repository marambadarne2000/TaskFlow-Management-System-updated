<?php
// מנהל יוצר תרחיש בדיקה מלא ומקצה אותו לעובד
if ($action === "quality-case-save") {
    admin();
    $projectId = (int) ($data["project_id"] ?? 0);
    $title = trim((string) ($data["title"] ?? ""));
    $steps = trim((string) ($data["steps"] ?? ""));
    $expected = trim((string) ($data["expected_result"] ?? ""));
    $priority = (string) ($data["priority"] ?? "medium");
    if (!$projectId || !$title || !$steps || !$expected || !in_array($priority, ["low","medium","high","critical"], true)) out(["error" => "יש למלא את כל פרטי הבדיקה"], 422);
    $pdo = db();
    $assignedTo = (int) ($data["assigned_to"] ?? 0) ?: null;
    if ($assignedTo) {
        $employee = $pdo->prepare("SELECT 1 FROM users WHERE id=? AND role='employee' AND status='active'");
        $employee->execute([$assignedTo]);
        if (!$employee->fetchColumn()) out(["error" => "ניתן להקצות בדיקה רק לעובד פעיל"], 422);
    }
    $query = $pdo->prepare("INSERT INTO qa_test_cases(project_id,title,preconditions,steps,expected_result,priority,created_by,assigned_to) VALUES(?,?,?,?,?,?,?,?)");
    $query->execute([$projectId,$title,trim((string) ($data["preconditions"] ?? "")) ?: null,$steps,$expected,$priority,user()["id"],$assignedTo]);
    $id = (int) $pdo->lastInsertId();
    if ($assignedTo) {
        $notice = $pdo->prepare("INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)");
        $notice->execute([$assignedTo,"בדיקת איכות חדשה","הוקצה אליך תרחיש הבדיקה: " . $title]);
    }
    log_activity("יצירת תרחיש בדיקה", "נוצר תרחיש בדיקה מספר " . $id . ": " . $title);
    out(["ok" => true, "id" => $id]);
}
