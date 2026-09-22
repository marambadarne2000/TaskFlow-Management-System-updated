<?php
// שומר פעולות חשובות ביומן הבקרה של המערכת
declare(strict_types=1);

function log_activity(string $actionName, string $details): void
{
    $currentUser = user();
    log_activity_for_user((int) $currentUser["id"], $actionName, $details);
}

// שומר אירוע עבור משתמש ידוע גם בתהליך שבו עדיין אין Session פעיל
function log_activity_for_user(int $userId, string $actionName, string $details): void
{
    $query = db()->prepare(
        "INSERT INTO activity_logs(user_id,action_name,details) VALUES(?,?,?)",
    );
    $query->execute([$userId, mb_substr($actionName, 0, 100), mb_substr($details, 0, 255)]);
}
