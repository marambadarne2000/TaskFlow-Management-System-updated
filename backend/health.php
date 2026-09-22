<?php
// בדיקת תקינות: בודקת ששרת צד השרת והחיבור ל-מסד הנתונים פעילים
if ($action === "health") {
    db()->query("SELECT 1");
    out([
        "ok" => true,
        "service" => "TaskFlow API",
        "instance" => "taskflow-student-api-v2",
    ]);
}
