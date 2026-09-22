<?php
// מריץ את חוקי ההתראה הפעילים ומונע הודעה כפולה באותו יום
if ($action === "automation-run") {
    admin();
    $pdo = db();
    $requestedId = trim((string) ($data["id"] ?? ""));
    $allowedIds = ["overdue", "capacity", "complete", "deadline"];
    if ($requestedId !== "" && !in_array($requestedId, $allowedIds, true)) out(["error" => "חוק האוטומציה אינו תקין"], 422);
    if ($requestedId !== "") {
        $query = $pdo->prepare("SELECT id FROM automation_rules WHERE enabled=1 AND id=?");
        $query->execute([$requestedId]);
        $rules = $query->fetchAll(PDO::FETCH_COLUMN);
    } else {
        $rules = $pdo->query("SELECT id FROM automation_rules WHERE enabled=1")->fetchAll(PDO::FETCH_COLUMN);
    }
    if (!$rules) out(["error" => "לא נמצאו חוקים פעילים להרצה"], 409);
    $created = 0;
    $insert = $pdo->prepare("INSERT INTO notifications(user_id,title,message) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM notifications WHERE user_id=? AND title=? AND message=? AND DATE(created_at)=CURDATE())");
    if (in_array("overdue",$rules,true)) {
        $items = $pdo->query("SELECT id,title,assignee_id FROM tasks WHERE status!='done' AND due_date<CURDATE() AND assignee_id IS NOT NULL")->fetchAll();
        foreach ($items as $item) {$message="המשימה " . $item["title"] . " נמצאת באיחור";$insert->execute([$item["assignee_id"],"התראת איחור",$message,$item["assignee_id"],"התראת איחור",$message]);$created += $insert->rowCount();}
    }
    if (in_array("deadline",$rules,true)) {
        $items = $pdo->query("SELECT title,assignee_id,DATEDIFF(due_date,CURDATE()) days_left FROM tasks WHERE status!='done' AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 3 DAY) AND assignee_id IS NOT NULL")->fetchAll();
        foreach ($items as $item) {$message="למשימה " . $item["title"] . " נותרו " . $item["days_left"] . " ימים";$insert->execute([$item["assignee_id"],"מועד מתקרב",$message,$item["assignee_id"],"מועד מתקרב",$message]);$created += $insert->rowCount();}
    }
    if ($rules) {$placeholders=implode(",",array_fill(0,count($rules),"?"));$update=$pdo->prepare("UPDATE automation_rules SET runs=runs+1,last_run_at=NOW() WHERE id IN ($placeholders)");$update->execute($rules);}
    log_activity("הרצת אוטומציות", "נוצרו " . $created . " התראות חדשות");
    out(["ok" => true,"created" => $created,"executed" => $rules,"executed_count" => count($rules),"ran_at" => date(DATE_ATOM)]);
}
