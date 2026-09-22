<?php
// מחזיר את פרטי המשתמש שנמצא כרגע ב-נתוני ההתחברות השמורים בשרת
if ($action === "me") {
    out(["user" => user(), "csrf_token" => csrf_token()]);
}
