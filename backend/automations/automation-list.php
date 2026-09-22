<?php
// מחזיר את חוקי האוטומציה האמיתיים ממסד הנתונים
if ($action === "automation-list") {
    admin();
    out(["items" => db()->query("SELECT * FROM automation_rules ORDER BY FIELD(id,'overdue','capacity','complete','deadline')")->fetchAll()]);
}
