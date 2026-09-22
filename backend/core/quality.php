<?php
// מרכז את חוקי שער האיכות כדי שכל חלקי המערכת יקבלו אותה החלטה
declare(strict_types=1);

function project_quality_gate(int $projectId): array
{
    $query = db()->prepare(
        "SELECT
            (SELECT COUNT(*) FROM qa_test_cases WHERE project_id=? AND status!='passed') failed_tests,
            (SELECT COUNT(*) FROM qa_bugs WHERE project_id=? AND severity='critical' AND status NOT IN ('resolved','closed')) critical_bugs",
    );
    $query->execute([$projectId, $projectId]);
    $result = $query->fetch();
    $failedTests = (int) ($result["failed_tests"] ?? 0);
    $criticalBugs = (int) ($result["critical_bugs"] ?? 0);
    return [
        "allowed" => $failedTests === 0 && $criticalBugs === 0,
        "failed_tests" => $failedTests,
        "critical_bugs" => $criticalBugs,
    ];
}

// מסיים פרויקט רק כאשר כל המשימות הסתיימו וגם שער האיכות פתוח
function sync_project_completion(int $projectId): array
{
    $query = db()->prepare("SELECT COUNT(*) total,COALESCE(SUM(status='done'),0) done FROM tasks WHERE project_id=?");
    $query->execute([$projectId]);
    $tasks = $query->fetch();
    $quality = project_quality_gate($projectId);
    $complete = (int) $tasks["total"] > 0 && (int) $tasks["total"] === (int) $tasks["done"] && $quality["allowed"];
    $query = db()->prepare("UPDATE projects SET status=?,completed_at=IF(?='completed',COALESCE(completed_at,NOW()),NULL) WHERE id=?");
    $query->execute([$complete ? "completed" : "in_progress", $complete ? "completed" : "in_progress", $projectId]);
    return ["complete" => $complete, "quality" => $quality];
}
