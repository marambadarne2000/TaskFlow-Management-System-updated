<?php
// מרכז את בדיקות ההתחברות וההרשאה כדי שכל פעולה תשתמש באותם כללים
declare(strict_types=1);

function user(): array
{
    validate_session();
    if (empty($_SESSION["user"])) {
        out(["error" => "נדרשת התחברות"], 401);
    }

    return $_SESSION["user"];
}

function admin(): array
{
    $currentUser = user();
    if (($currentUser["role"] ?? "") !== "admin") {
        out(["error" => "פעולה למנהל בלבד"], 403);
    }

    return $currentUser;
}
