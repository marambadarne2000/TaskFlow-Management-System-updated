<?php
// מוחק פריטים שנבחרו לאחר בדיקת מנהל, תקינות המזהים וקיום כל הרשומות; כישלון מבטל את המחיקה כולה.
admin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out(["error" => "יש לשלוח בקשת מחיקה תקינה"], 405);
}

$ids = $data["ids"] ?? [$data["id"] ?? null];
if (!is_array($ids) || !$ids || count($ids) > 500) {
    out(["error" => "יש לבחור בין פריט אחד לחמש מאות פריטים"], 422);
}
foreach ($ids as $id) {
    if ((!is_int($id) && !is_string($id)) || !ctype_digit((string) $id) || (int) $id <= 0) {
        out(["error" => "מזהה פריט לא תקין"], 422);
    }
}
$ids = array_values(array_unique(array_map("intval", $ids)));
$isProject = $action === "project-delete";
$table = $isProject ? "projects" : "tasks";
$titleColumn = $isProject ? "name" : "title";
$marks = implode(",", array_fill(0, count($ids), "?"));
$pdo = db();

try {
    $pdo->beginTransaction();
    $query = $pdo->prepare("SELECT * FROM $table WHERE id IN ($marks) ORDER BY id FOR UPDATE");
    $query->execute($ids);
    $items = $query->fetchAll();
    if (count($items) !== count($ids)) {
        $pdo->rollBack();
        out(["error" => "חלק מהפריטים כבר לא קיימים. רעננו את הרשימה ובחרו שוב."], 404);
    }

    $query = $pdo->prepare("DELETE FROM $table WHERE id IN ($marks)");
    $query->execute($ids);

    // לאחר מחיקת משימות מחשב מחדש את מצבי הפרויקטים שנפגעו.
    if (!$isProject) {
        foreach (array_unique(array_column($items, "project_id")) as $projectId) {
            $query = $pdo->prepare("SELECT COUNT(*) total,COALESCE(SUM(status='done'),0) done FROM tasks WHERE project_id=?");
            $query->execute([$projectId]);
            $counts = $query->fetch();
            $status = (int) $counts["total"] === 0
                ? "planned"
                : ((int) $counts["total"] === (int) $counts["done"] ? "completed" : "in_progress");
            $query = $pdo->prepare("UPDATE projects SET status=?,completed_at=IF(?='completed',COALESCE(completed_at,NOW()),NULL) WHERE id=?");
            $query->execute([$status, $status, $projectId]);
        }
    }

    foreach ($items as $item) {
        log_activity(
            $isProject ? "מחיקת פרויקט" : "מחיקת משימה",
            "נמחק: " . $item[$titleColumn],
        );
    }
    $pdo->commit();
    out(["ok" => true, "deleted_ids" => $ids]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("TaskFlow deletion failed: " . $error->getMessage());
    out(["error" => "המחיקה לא הושלמה. לא נמחקו פריטים, אפשר לנסות שוב."], 500);
}
