<?php
// בודק עומס והרשאת עובד, יוצר משימה ושולח לעובד התראה
if ($action === "task-create") {
    // רק מנהל יכול ליצור ולהקצות משימה חדשה
    admin();
    $pdo = db();
 // פעולה אטומית במסד הנתונים מבטיח שהמשימה וההתראה יישמרו יחד או שלא יישמרו בכלל
    $pdo->beginTransaction();
    $q = $pdo->prepare(
        "SELECT full_name,role,status,max_active_tasks FROM users WHERE id=? FOR UPDATE",
    );
    $q->execute([$data["assignee_id"]]);
    $e = $q->fetch();
    // אי אפשר להקצות משימה לעובד חסום או לעובד שלא קיים
    if (!$e || $e["role"] !== "employee" || $e["status"] !== "active") {
        $pdo->rollBack();
        out(["error" => "ניתן להקצות משימה רק לעובד פעיל"], 422);
    }
    $q = $pdo->prepare(
        "SELECT COUNT(*) FROM tasks WHERE assignee_id=? AND status!='done'",
    );
    $q->execute([$data["assignee_id"]]);
    $count = (int) $q->fetchColumn();
    // מניעת חריגה ממגבלת המשימות הפעילות של העובד
    if (automation_enabled("capacity") && $count >= (int) $e["max_active_tasks"]) {
        $pdo->rollBack();
        out(["error" => "העובד הגיע למגבלת המשימות"], 409);
    }
    // מונע הקצאת משימה שמועד הסיום שלה נמצא בתוך חופשה מאושרת
    $q = $pdo->prepare(
        "SELECT 1 FROM employee_requests
         WHERE employee_id=? AND request_type='vacation' AND status='approved'
           AND ? BETWEEN start_date AND end_date
         LIMIT 1",
    );
    $q->execute([$data["assignee_id"], $data["due_date"]]);
    if ($q->fetchColumn()) {
        $pdo->rollBack();
        out(["error" => "לא ניתן להקצות משימה שמסתיימת בזמן חופשה מאושרת"], 409);
    }
    // תלות מותרת רק במשימה אחרת מאותו פרויקט וכך נמנעת שרשרת לא הגיונית
    $dependencyId = (int) ($data["dependency_task_id"] ?? 0);
    if ($dependencyId > 0) {
        $q = $pdo->prepare("SELECT id FROM tasks WHERE id=? AND project_id=?");
        $q->execute([$dependencyId, $data["project_id"]]);
        if (!$q->fetchColumn()) {
            $pdo->rollBack();
            out(["error" => "המשימה התלויה חייבת להיות משימה אחרת מאותו פרויקט"], 422);
        }
    }
    $q = $pdo->prepare(
        "INSERT INTO tasks(project_id,assignee_id,title,description,priority,due_date,estimated_hours,dependency_task_id,labels) VALUES(?,?,?,?,?,?,?,?,?)",
    );
    $q->execute([
        $data["project_id"],
        $data["assignee_id"],
        $data["title"],
        $data["description"] ?? null,
        $data["priority"] ?? "medium",
        $data["due_date"],
        max(0, (float) ($data["estimated_hours"] ?? 0)),
        $dependencyId ?: null,
        trim((string) ($data["labels"] ?? "")),
    ]);
    $taskId = (int) $pdo->lastInsertId();
    // לאחר יצירת המשימה נוצרת לעובד התראה אוטומטית
    $q = $pdo->prepare(
        "INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)",
    );
    $q->execute([
        $data["assignee_id"],
        "משימה חדשה",
        "הוקצתה אליך המשימה: " . $data["title"],
    ]);
    $pdo->commit();
    log_activity("יצירת משימה", "נוצרה המשימה: " . $data["title"]);
    out(["ok" => true, "id" => $taskId]);
}
