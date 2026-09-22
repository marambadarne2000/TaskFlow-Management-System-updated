<?php
// יוצר פרויקט חדש, מקשר אותו למנהל המחובר ורושם את הפעולה בהיסטוריה
if ($action === "project-create") {
    $u = admin();
    $q = db()->prepare(
        "INSERT INTO projects(name,description,start_date,due_date,created_by,budget,planned_hours,priority,tags,external_link) VALUES(?,?,?,?,?,?,?,?,?,?)",
    );
    $q->execute([
        $data["name"],
        $data["description"] ?? null,
        ($data["start_date"] ?? "") ?: null,
        $data["due_date"],
        $u["id"],
        max(0, (float) ($data["budget"] ?? 0)),
        max(0, (float) ($data["planned_hours"] ?? 0)),
        in_array($data["priority"] ?? "medium", ["low", "medium", "high", "critical"], true) ? $data["priority"] : "medium",
        trim((string) ($data["tags"] ?? "")),
        filter_var($data["external_link"] ?? "", FILTER_VALIDATE_URL) ?: null,
    ]);
    $projectId = (int) db()->lastInsertId();
    log_activity("יצירת פרויקט", "נוצר הפרויקט: " . $data["name"]);
    out(["id" => $projectId]);
}
