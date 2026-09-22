<?php
// יוצר אסימון זמני וקישור מאובטח לאיפוס סיסמה
if ($action === "forgot-password") {
    $email = normalized_email($data["email"] ?? "");
    $message = "אם האימייל קיים במערכת, נוצר עבורו קישור איפוס";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        out(["message" => $message]);
    }
    $q = db()->prepare(
        'SELECT id,full_name FROM users WHERE email=? AND status="active"',
    );
    $q->execute([$email]);
    $u = $q->fetch();
    if (!$u) {
        out(["message" => $message]);
    }
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash("sha256", $token);
    $deleteOld = db()->prepare("DELETE FROM password_resets WHERE user_id=? OR expires_at<NOW()");
    $deleteOld->execute([$u["id"]]);
    $q = db()->prepare(
        "INSERT INTO password_resets(user_id,token,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 30 MINUTE))",
    );
    $q->execute([$u["id"], $tokenHash]);
    log_activity_for_user((int) $u["id"], "בקשת איפוס סיסמה", "נוצר קישור איפוס מאובטח ל-30 דקות");
    $link = "http://127.0.0.1:4300/?reset_token=" . $token;
 // בפרויקט המקומי אין שרת שליחת דואר, לכן מציגים את הקישור מיד במסך
    out([
        "message" => "קישור איפוס נוצר ותוקפו 30 דקות",
        "reset_link" => $link,
    ]);
}
