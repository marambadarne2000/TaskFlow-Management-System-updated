<?php
// שומר את תוכנית הספרינט בפעולה אטומית
if ($action === "sprint-save") {
    $currentUser = admin();
    $ids = array_values(array_unique(array_filter(array_map("intval",(array) ($data["task_ids"] ?? [])))));
    $weeks = max(1,min(4,(int) ($data["weeks"] ?? 2)));
    $pdo = db();$pdo->beginTransaction();$pdo->exec("DELETE FROM sprint_plan_items");
    $insert=$pdo->prepare("INSERT INTO sprint_plan_items(task_id,weeks,selected_by) SELECT id,?,? FROM tasks WHERE id=? AND status!='done'");
    foreach($ids as $id)$insert->execute([$weeks,$currentUser["id"],$id]);
    $pdo->commit();log_activity("עדכון ספרינט","נבחרו " . count($ids) . " משימות");out(["ok"=>true]);
}
