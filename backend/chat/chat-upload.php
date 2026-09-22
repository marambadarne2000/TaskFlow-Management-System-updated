<?php
// שומר קובץ בצ׳אט רק למנהל החדר או לחבר בצוות הפרויקט
if ($action === "chat-upload") {
    $currentUser = user();
    $projectId = (int) ($_POST["project_id"] ?? 0);
    $managerId =
        $currentUser["role"] === "admin"
            ? (int) $currentUser["id"]
            : (int) ($_POST["manager_id"] ?? 0);

    if ($currentUser["role"] !== "admin") {
        $query = db()->prepare(
            "SELECT 1 FROM tasks WHERE project_id=? AND assignee_id=? LIMIT 1",
        );
        $query->execute([$projectId, $currentUser["id"]]);
        if (!$query->fetchColumn()) {
            out(["error" => "אין לך הרשאה לצ׳אט של הפרויקט"], 403);
        }
    }

    $query = db()->prepare(
        "SELECT 1 FROM users WHERE id=? AND role='admin' AND status='active'",
    );
    $query->execute([$managerId]);
    if (!$query->fetchColumn() || empty($_FILES["file"])) {
        out(["error" => "יש לבחור מנהל וקובץ תקינים"], 422);
    }

    $file = $_FILES["file"];
    [$extension] = validate_upload(
        $file,
        [
            "pdf" => ["application/pdf"],
            "doc" => ["application/msword", "application/CDFV2"],
            "docx" => [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/zip",
            ],
            "png" => ["image/png"],
            "jpg" => ["image/jpeg"],
            "jpeg" => ["image/jpeg"],
            "txt" => ["text/plain"],
            "zip" => ["application/zip", "application/x-zip-compressed"],
        ],
        5 * 1024 * 1024,
    );

    $folder = __DIR__ . "/uploads";
    if (!is_dir($folder)) {
        mkdir($folder, 0775, true);
    }

    $savedName = bin2hex(random_bytes(8)) . "." . $extension;
    if (!move_uploaded_file($file["tmp_name"], $folder . "/" . $savedName)) {
        out(["error" => "שמירת הקובץ נכשלה"], 500);
    }

    $originalName = safe_original_name($file["name"]);
    $query = db()->prepare(
        "INSERT INTO project_messages(project_id,manager_id,user_id,message,file_name,file_path) VALUES(?,?,?,?,?,?)",
    );
    $query->execute([
        $projectId,
        $managerId,
        $currentUser["id"],
        "נשלח קובץ",
        $originalName,
        $savedName,
    ]);
    log_activity("העלאת קובץ", "הועלה הקובץ " . $originalName . " לפרויקט מספר " . $projectId);

    out([
        "ok" => true,
        "id" => (int) db()->lastInsertId(),
        "file_name" => $originalName,
    ]);
}
