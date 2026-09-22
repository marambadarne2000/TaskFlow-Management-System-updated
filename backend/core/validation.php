<?php
// מרכז בדיקות קלט שחוזרות במספר פעולות
declare(strict_types=1);

function normalized_email(mixed $value): string
{
    return strtolower(trim((string) $value));
}

function valid_password(string $password): bool
{
    return strlen($password) >= 8 &&
        preg_match('/[A-Za-z]/', $password) === 1 &&
        preg_match('/\d/', $password) === 1;
}

function require_valid_password(string $password): void
{
    if (!valid_password($password)) {
        out(["error" => "הסיסמה חייבת להכיל לפחות 8 תווים, אות ומספר"], 422);
    }
}
