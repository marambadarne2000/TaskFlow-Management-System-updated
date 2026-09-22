<?php
// בודק ושומר קובץ קורות חיים ומקשר אותו לעובד
if ($action === "user-upload-cv") {
    admin();
    $id = (int) ($_POST["user_id"] ?? 0);
    if (empty($_FILES["cv"])) {
        out(["error" => "לא נבחר קובץ"], 422);
    }
    $file = $_FILES["cv"];
    [$ext] = validate_upload(
        $file,
        [
            "pdf" => ["application/pdf"],
            "doc" => ["application/msword", "application/CDFV2"],
            "docx" => [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/zip",
            ],
        ],
        5 * 1024 * 1024,
    );
    $dir = __DIR__ . "/uploads/cv";
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $name = "employee_" . $id . "_" . bin2hex(random_bytes(8)) . "." . $ext;
    if (!move_uploaded_file($file["tmp_name"], $dir . "/" . $name)) {
        out(["error" => "שמירת הקובץ נכשלה"], 500);
    }
    $q = db()->prepare("UPDATE users SET cv_file=? WHERE id=?");
    $q->execute([$name, $id]);
    log_activity("העלאת קורות חיים", "עודכן קובץ קורות החיים של עובד מספר " . $id);
    out(["ok" => true, "file" => $name]);
}
