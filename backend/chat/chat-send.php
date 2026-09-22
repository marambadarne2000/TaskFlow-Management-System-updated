<?php
// שומר הודעת צאט רק אם המשתמש שייך לצוות הפרויקט או שהוא מנהל
if ($action === "chat-send") {
    $u = user();
    $projectId = (int) ($data["project_id"] ?? 0);
    $managerId =
        $u["role"] === "admin"
            ? (int) $u["id"]
            : (int) ($data["manager_id"] ?? 0);
    $message = trim((string) ($data["message"] ?? ""));
    if ($message === "") {
        out(["error" => "לא ניתן לשלוח הודעה ריקה"], 422);
    }
    if ($u["role"] !== "admin") {
        $q = db()->prepare(
            "SELECT 1 FROM tasks WHERE project_id=? AND assignee_id=? LIMIT 1",
        );
        $q->execute([$projectId, $u["id"]]);
        if (!$q->fetchColumn()) {
            out(["error" => "אינך חבר/ה בצוות הפרויקט"], 403);
        }
    }
    $q = db()->prepare(
        "SELECT 1 FROM users WHERE id=? AND role='admin' AND status='active'",
    );
    $q->execute([$managerId]);
    if (!$q->fetchColumn()) {
        out(["error" => "המנהל שנבחר אינו פעיל"], 422);
    }
    $q = db()->prepare(
        "INSERT INTO project_messages(project_id,manager_id,user_id,message) VALUES(?,?,?,?)",
    );
    $q->execute([$projectId, $managerId, $u["id"], $message]);
    log_activity("שליחת הודעה", "נשלחה הודעה בצ׳אט של פרויקט מספר " . $projectId);
    out(["ok" => true, "id" => (int) db()->lastInsertId()]);
}
