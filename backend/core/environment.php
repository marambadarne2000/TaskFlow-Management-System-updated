<?php
// טוען הגדרות מקובץ מקומי כדי שלא לשמור סיסמאות בתוך קוד המקור
declare(strict_types=1);

function load_environment(string $file): void
{
    if (!is_file($file)) {
        return;
    }

    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === "" || str_starts_with($line, "#") || !str_contains($line, "=")) {
            continue;
        }

        [$name, $value] = array_map("trim", explode("=", $line, 2));
        $value = trim($value, "\"'");
        if ($name !== "" && getenv($name) === false) {
            putenv($name . "=" . $value);
            $_ENV[$name] = $value;
        }
    }
}

function env_value(string $name, string $default = ""): string
{
    $value = getenv($name);
    return $value === false ? $default : $value;
}

load_environment(dirname(__DIR__) . "/.env");
