<?php
// מחזיר את ההתראות של המשתמש המחובר לפי סדר התאריך
if ($action === "notifications") {
    $u = user();
    $q = db()->prepare(
        "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC",
    );
    $q->execute([$u["id"]]);
    out(["items" => $q->fetchAll()]);
}
