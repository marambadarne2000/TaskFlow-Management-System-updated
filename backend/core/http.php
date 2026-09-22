<?php
// מטפל בכותרות HTTP, בנתוני קלט ובמבנה אחיד של תשובות JSON
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

$allowedOrigins = array_filter(array_map(
    "trim",
    explode(",", env_value("APP_ALLOWED_ORIGINS", "http://127.0.0.1:4300,http://localhost:4300")),
));
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");

if (($_SERVER["REQUEST_METHOD"] ?? "GET") === "OPTIONS") {
    exit();
}

session_set_cookie_params([
    "httponly" => true,
    "samesite" => "Lax",
    "secure" => env_value("APP_SECURE_COOKIE", "0") === "1",
]);
session_start();

function input(): array
{
    $raw = file_get_contents("php://input");
    if ($raw === false || trim($raw) === "") {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        out(["error" => "מבנה הבקשה אינו תקין"], 400);
    }

    return $data;
}

function out(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

function server_error(Throwable $error): never
{
    error_log($error->__toString());
    out(["error" => "אירעה שגיאה פנימית בשרת"], 500);
}
