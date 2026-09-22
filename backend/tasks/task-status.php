<?php
// מעדכן מצב משימה ומסמן אוטומטית את הפרויקט כהסתיים כשכולן הושלמו
if ($action === "task-status") {
    $u = user();
    // שליפת המשימה מאפשרת לבדוק שהעובד מעדכן רק משימה שהוקצתה אליו
    $q = db()->prepare("SELECT project_id,assignee_id FROM tasks WHERE id=?");
    $q->execute([$data["id"]]);
    $t = $q->fetch();
    if (
        !$t ||
        ($u["role"] !== "admin" && (int) $t["assignee_id"] !== (int) $u["id"])
    ) {
        out(["error" => "אין הרשאה"], 403);
    }
    // משימה תלויה אינה יכולה להתחיל לפני שהמשימה הקודמת הושלמה
    if (($data["status"] ?? "todo") !== "todo") {
        $dependency = db()->prepare("SELECT parent.status FROM tasks current_task JOIN tasks parent ON parent.id=current_task.dependency_task_id WHERE current_task.id=?");
        $dependency->execute([$data["id"]]);
        $dependencyStatus = $dependency->fetchColumn();
        if ($dependencyStatus && $dependencyStatus !== "done") out(["error" => "יש להשלים קודם את המשימה התלויה"], 409);
    }
 // שמירת הסטטוס ותאריך השלמה רק כאשר המצב הוא הושלם
    $q = db()->prepare(
        "UPDATE tasks SET status=?,completed_at=IF(?='done',NOW(),NULL) WHERE id=?",
    );
    $q->execute([$data["status"], $data["status"], $data["id"]]);
    // כשהמשימה הושלמה, כל משימה שחיכתה לה נפתחת מיד והעובד מקבל התראה
    $unlocked = [];
    if ($data["status"] === "done") {
        $q = db()->prepare("SELECT id,title,assignee_id FROM tasks WHERE dependency_task_id=? AND status='todo'");
        $q->execute([$data["id"]]);
        $unlocked = $q->fetchAll();
        $notice = db()->prepare("INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)");
        foreach ($unlocked as $nextTask) {
            $notice->execute([
                $nextTask["assignee_id"],
                "משימה נפתחה לביצוע",
                "המשימה " . $nextTask["title"] . " מוכנה עכשיו להתחלה",
            ]);
        }
    }
    // מצב הפרויקט מחושב גם לפי השלמת המשימות וגם לפי שער האיכות
    $projectState = automation_enabled("complete")
        ? sync_project_completion((int) $t["project_id"])
        : ["complete" => false, "quality" => project_quality_gate((int) $t["project_id"])];
    $complete = $projectState["complete"];
    log_activity(
        "עדכון משימה",
        "מצב משימה מספר " . $data["id"] . " שונה ל-" . $data["status"],
    );
    out([
        "ok" => true,
        "project_completed" => $complete,
        "quality_gate" => $projectState["quality"],
        "unlocked_tasks" => array_map(fn($item) => ["id" => (int) $item["id"], "title" => $item["title"]], $unlocked),
    ]);
}
