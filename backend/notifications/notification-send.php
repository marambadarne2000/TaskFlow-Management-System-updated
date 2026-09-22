<?php
// מאפשר למנהל לשלוח התראה לעובד אחד או לכל העובדים הפעילים
if ($action === "notification-send") {
    admin();
    $userId = (int) ($data["user_id"] ?? 0);
    $title = $data["title"] ?? "הודעה מהמנהל";
    $message = trim((string) ($data["message"] ?? ""));
    if ($message === "") {
        out(["error" => "יש לכתוב הודעה"], 422);
    }
    if ($userId === 0) {
        $q = db()->prepare(
            "INSERT INTO notifications(user_id,title,message) SELECT id,?,? FROM users WHERE role='employee' AND status='active'",
        );
        $q->execute([$title, $message]);
        log_activity("שליחת התראה", "נשלחה התראה ל-" . $q->rowCount() . " עובדים");
        out(["ok" => true, "sent_to" => $q->rowCount()]);
    }
    $q = db()->prepare(
        "SELECT 1 FROM users WHERE id=? AND role='employee' AND status='active'",
    );
    $q->execute([$userId]);
    if (!$q->fetchColumn()) {
        out(["error" => "יש לבחור עובד פעיל"], 422);
    }
    $q = db()->prepare(
        "INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)",
    );
    $q->execute([$userId, $title, $message]);
    log_activity("שליחת התראה", "נשלחה התראה לעובד מספר " . $userId);
    out(["ok" => true, "id" => (int) db()->lastInsertId(), "sent_to" => 1]);
}
