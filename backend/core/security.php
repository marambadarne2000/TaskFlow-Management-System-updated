<?php
// מרכז הגנות Session ו-CSRF והגבלת ניסיונות כניסה
declare(strict_types=1);

function security_headers(): void
{
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("Referrer-Policy: no-referrer");
    header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
    header("Cache-Control: no-store, max-age=0");
}

function csrf_token(): string
{
    if (empty($_SESSION["csrf_token"])) {
        $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
    }

    return $_SESSION["csrf_token"];
}

function require_csrf(): void
{
    $received = (string) ($_SERVER["HTTP_X_CSRF_TOKEN"] ?? "");
    $expected = (string) ($_SESSION["csrf_token"] ?? "");

    if ($expected === "" || $received === "" || !hash_equals($expected, $received)) {
        out(["error" => "בקשת האבטחה אינה תקינה, יש להתחבר מחדש"], 419);
    }
}

function begin_user_session(array $user): void
{
    session_regenerate_id(true);
    $_SESSION["user"] = $user;
    $_SESSION["created_at"] = time();
    $_SESSION["last_activity"] = time();
    $_SESSION["user_agent_hash"] = hash("sha256", $_SERVER["HTTP_USER_AGENT"] ?? "unknown");
    $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
}

function validate_session(): void
{
    if (empty($_SESSION["user"])) {
        return;
    }

    $now = time();
    $idleLimit = (int) env_value("SESSION_IDLE_SECONDS", "1800");
    $absoluteLimit = (int) env_value("SESSION_MAX_SECONDS", "28800");
    $expectedAgent = (string) ($_SESSION["user_agent_hash"] ?? "");
    $currentAgent = hash("sha256", $_SERVER["HTTP_USER_AGENT"] ?? "unknown");
    $expired =
        $now - (int) ($_SESSION["last_activity"] ?? $now) > $idleLimit ||
        $now - (int) ($_SESSION["created_at"] ?? $now) > $absoluteLimit;

    if ($expired || ($expectedAgent !== "" && !hash_equals($expectedAgent, $currentAgent))) {
        clear_user_session();
        out(["error" => "ההתחברות הסתיימה, יש להתחבר מחדש"], 401);
    }

    $_SESSION["last_activity"] = $now;
}

function clear_user_session(): void
{
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $parameters = session_get_cookie_params();
        setcookie(session_name(), "", [
            "expires" => time() - 42000,
            "path" => $parameters["path"],
            "domain" => $parameters["domain"],
            "secure" => $parameters["secure"],
            "httponly" => $parameters["httponly"],
            "samesite" => "Lax",
        ]);
    }
    session_destroy();
}

function login_key(string $email): string
{
    $ip = $_SERVER["REMOTE_ADDR"] ?? "unknown";
    return hash("sha256", strtolower(trim($email)) . "|" . $ip);
}

function assert_login_allowed(string $email): void
{
    $query = db()->prepare(
        "SELECT COUNT(*) FROM login_attempts
         WHERE attempt_key=? AND succeeded=0 AND attempted_at>=DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
    );
    $query->execute([login_key($email)]);

    if ((int) $query->fetchColumn() >= 5) {
        out(["error" => "בוצעו יותר מדי ניסיונות, יש לנסות שוב בעוד 15 דקות"], 429);
    }
}

function record_login_attempt(string $email, bool $succeeded): void
{
    $key = login_key($email);
    $query = db()->prepare(
        "INSERT INTO login_attempts(attempt_key,email_address,ip_address,succeeded)
         VALUES(?,?,?,?)",
    );
    $query->execute([
        $key,
        strtolower(trim($email)),
        $_SERVER["REMOTE_ADDR"] ?? "unknown",
        $succeeded ? 1 : 0,
    ]);

    if ($succeeded) {
        $cleanup = db()->prepare("DELETE FROM login_attempts WHERE attempt_key=? AND succeeded=0");
        $cleanup->execute([$key]);
    }
}

security_headers();
validate_session();
