<?php
// מאפשר למנהל לעדכן את פרטי הפרויקט בלי לשנות את המנהל או תאריך היצירה.
if ($action === "project-update") {
    admin();
    $id = (int) ($data["id"] ?? 0);
    $name = trim((string) ($data["name"] ?? ""));
    $description = trim((string) ($data["description"] ?? ""));
    $dueDate = (string) ($data["due_date"] ?? "");
    $startDate = (string) ($data["start_date"] ?? "");
    $budget = max(0, (float) ($data["budget"] ?? 0));
    $plannedHours = max(0, (float) ($data["planned_hours"] ?? 0));
    $priority = in_array($data["priority"] ?? "medium", ["low", "medium", "high", "critical"], true) ? $data["priority"] : "medium";
    $tags = trim((string) ($data["tags"] ?? ""));
    $externalLink = filter_var($data["external_link"] ?? "", FILTER_VALIDATE_URL) ?: null;

    if ($id <= 0 || $name === "" || $dueDate === "") {
        out(["error" => "יש למלא שם ומועד סיום"], 422);
    }

    $q = db()->prepare(
        "UPDATE projects SET name=?,description=?,start_date=?,due_date=?,budget=?,planned_hours=?,priority=?,tags=?,external_link=? WHERE id=?",
    );
    $q->execute([$name, $description ?: null, $startDate ?: null, $dueDate, $budget, $plannedHours, $priority, $tags, $externalLink, $id]);
    if ($q->rowCount() === 0) {
        $exists = db()->prepare("SELECT 1 FROM projects WHERE id=?");
        $exists->execute([$id]);
        if (!$exists->fetchColumn()) {
            out(["error" => "הפרויקט לא נמצא"], 404);
        }
    }

    log_activity("עדכון פרויקט", "עודכן הפרויקט: " . $name);
    out(["ok" => true]);
}
