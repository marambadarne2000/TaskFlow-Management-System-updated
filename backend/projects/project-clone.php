<?php
// משכפל פרויקט ואת המשימות שלו כתבנית חדשה לביצוע
if ($action === "project-clone") {
    $user = admin();
    $id = (int) ($data["id"] ?? 0);
    $pdo = db();
    $projectQuery = $pdo->prepare("SELECT * FROM projects WHERE id=?");
    $projectQuery->execute([$id]);
    $project = $projectQuery->fetch();
    if (!$project) out(["error" => "הפרויקט לא נמצא"], 404);
    $pdo->beginTransaction();
    $query = $pdo->prepare("INSERT INTO projects(name,description,start_date,due_date,created_by,budget,planned_hours,priority,tags,external_link) VALUES(?,?,?,?,?,?,?,?,?,?)");
    $query->execute([$project["name"] . " - עותק",$project["description"],date("Y-m-d"),date("Y-m-d", strtotime("+30 days")),$user["id"],$project["budget"],$project["planned_hours"],$project["priority"],$project["tags"],$project["external_link"]]);
    $newId = (int) $pdo->lastInsertId();
    $query = $pdo->prepare("INSERT INTO tasks(project_id,assignee_id,title,description,status,priority,due_date) SELECT ?,NULL,title,description,'todo',priority,DATE_ADD(CURDATE(),INTERVAL 30 DAY) FROM tasks WHERE project_id=?");
    $query->execute([$newId, $id]);
    $pdo->commit();
    log_activity("שכפול פרויקט", "נוצר עותק של " . $project["name"]);
    out(["ok" => true, "id" => $newId]);
}
