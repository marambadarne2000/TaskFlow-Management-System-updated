<?php
// מחזיר את תוכנית הספרינט המשותפת
if ($action === "sprint-list") {
    user();
    out(["items" => db()->query("SELECT task_id,weeks,selected_by,selected_at FROM sprint_plan_items ORDER BY selected_at")->fetchAll()]);
}
