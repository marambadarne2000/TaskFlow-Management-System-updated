<?php
// מחזיר נתוני QA רק מפרויקטים שהמשתמש רשאי לראות
if ($action === "quality-list") {
    $currentUser = user();
    $projectId = (int) ($_GET["project_id"] ?? 0);
    $accessSql = $currentUser["role"] === "admin"
        ? ""
        : " AND (q.assigned_to=" . (int) $currentUser["id"] . " OR EXISTS(SELECT 1 FROM tasks access_task WHERE access_task.project_id=q.project_id AND access_task.assignee_id=" . (int) $currentUser["id"] . "))";
    $projectFilter = $projectId ? " AND q.project_id=" . $projectId : "";

    $cases = db()->query("SELECT q.*,p.name project_name,creator.full_name creator_name,assignee.full_name assignee_name FROM qa_test_cases q JOIN projects p ON p.id=q.project_id JOIN users creator ON creator.id=q.created_by LEFT JOIN users assignee ON assignee.id=q.assigned_to WHERE 1=1 $projectFilter $accessSql ORDER BY FIELD(q.priority,'critical','high','medium','low'),q.updated_at DESC")->fetchAll();
    $bugs = db()->query("SELECT q.*,p.name project_name,reporter.full_name reporter_name,assignee.full_name assignee_name FROM qa_bugs q JOIN projects p ON p.id=q.project_id JOIN users reporter ON reporter.id=q.reported_by LEFT JOIN users assignee ON assignee.id=q.assigned_to WHERE 1=1 $projectFilter $accessSql ORDER BY FIELD(q.severity,'critical','high','medium','low'),q.updated_at DESC")->fetchAll();
    out(["cases" => $cases, "bugs" => $bugs]);
}
