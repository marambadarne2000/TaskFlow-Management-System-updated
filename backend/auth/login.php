<?php
// בודק אימייל וסיסמה, שומר את המשתמש ב-נתוני ההתחברות השמורים בשרת ורושם כניסה בהיסטוריה
if ($action === "login") {
    $email = normalized_email($data["email"] ?? "");
    $password = (string) ($data["password"] ?? "");
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === "") {
        out(["error" => "פרטי הכניסה אינם נכונים"], 401);
    }

    assert_login_allowed($email);
    // חיפוש המשתמש לפי האימייל שהתקבל מטופס הכניסה
    $q = db()->prepare(
        "SELECT id,full_name,email,password_hash,role,status,hourly_rate,max_active_tasks FROM users WHERE email=?",
    );
    $q->execute([$email]);
    $u = $q->fetch();
 // הפונקציה לבדיקת הסיסמה משווה את הסיסמה הרגילה מול הסיסמה המוצפנת שבטבלה
    if (
        !$u ||
        !password_verify($password, $u["password_hash"]) ||
        $u["status"] !== "active"
    ) {
        record_login_attempt($email, false);
        out(["error" => "פרטי הכניסה אינם נכונים"], 401);
    }

    record_login_attempt($email, true);
    if (password_needs_rehash($u["password_hash"], PASSWORD_DEFAULT)) {
        $rehash = db()->prepare("UPDATE users SET password_hash=? WHERE id=?");
        $rehash->execute([password_hash($password, PASSWORD_DEFAULT), $u["id"]]);
    }
    // לא מחזירים את הסיסמה המוצפנת לצד הלקוח
    unset($u["password_hash"]);
    begin_user_session($u);
    log_activity("כניסה למערכת", "המשתמש התחבר למערכת");
    out(["user" => $u, "csrf_token" => csrf_token()]);
}
