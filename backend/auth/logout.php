<?php
// מוחק את נתוני ה-נתוני ההתחברות השמורים בשרת ומוציא את המשתמש מהמערכת
if ($action === "logout") {
    user();
    log_activity("יציאה מהמערכת", "המשתמש יצא מהמערכת");
    clear_user_session();
    out(["ok" => true]);
}
