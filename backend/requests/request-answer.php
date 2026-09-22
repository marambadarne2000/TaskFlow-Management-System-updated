<?php
// מאשר או דוחה בקשה ומבצע את הפעולה המתאימה לאחר אישור
if ($action === "request-answer") {
    $manager = admin();
    $requestId = (int) ($data["id"] ?? 0);
    $decision = (string) ($data["status"] ?? "");
    $comment = trim((string) ($data["manager_comment"] ?? ""));
    if (!in_array($decision, ["approved", "rejected"], true)) {
        out(["error" => "החלטה לא תקינה"], 422);
    }

    $pdo = db();
    $pdo->beginTransaction();
    $query = $pdo->prepare(
        "SELECT * FROM employee_requests WHERE id=? AND manager_id=? AND status='pending' FOR UPDATE",
    );
    $query->execute([$requestId, $manager["id"]]);
    $request = $query->fetch();
    if (!$request) {
        $pdo->rollBack();
        out(["error" => "הבקשה לא נמצאה או שכבר טופלה"], 404);
    }

    if ($decision === "approved" && $request["request_type"] === "deadline") {
        $query = $pdo->prepare("UPDATE tasks SET due_date=? WHERE id=?");
        $query->execute([$request["requested_due_date"], $request["task_id"]]);
    }

    if ($decision === "approved" && $request["request_type"] === "task_swap") {
        $query = $pdo->prepare(
            "SELECT id,assignee_id,project_id FROM tasks WHERE id IN (?,?) FOR UPDATE",
        );
        $query->execute([$request["task_id"], $request["swap_task_id"]]);
        $tasks = $query->fetchAll();
        if (count($tasks) !== 2 || $tasks[0]["project_id"] !== $tasks[1]["project_id"]) {
            $pdo->rollBack();
            out(["error" => "לא ניתן לבצע את החלפת המשימות"], 422);
        }
        $first = $tasks[0];
        $second = $tasks[1];
        $query = $pdo->prepare("UPDATE tasks SET assignee_id=? WHERE id=?");
        $query->execute([$second["assignee_id"], $first["id"]]);
        $query->execute([$first["assignee_id"], $second["id"]]);
    }

    $query = $pdo->prepare(
        "UPDATE employee_requests SET status=?,manager_comment=?,answered_at=NOW() WHERE id=?",
    );
    $query->execute([$decision, $comment ?: null, $requestId]);
    $query = $pdo->prepare(
        "INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)",
    );
    $answerText = $decision === "approved" ? "אושרה" : "נדחתה";
    $query->execute([
        $request["employee_id"],
        "עדכון בקשה",
        "בקשה מספר " . $requestId . " " . $answerText,
    ]);
    log_activity("טיפול בבקשה", "בקשה מספר " . $requestId . " " . $answerText);
    $pdo->commit();
    out(["ok" => true]);
}
