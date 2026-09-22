<?php
// מחזיר סימוני טיפול בסיכונים לכל מנהלי המערכת
if ($action === "risk-treatment-list") {admin();out(["items"=>db()->query("SELECT r.*,u.full_name handled_by_name FROM risk_treatments r JOIN users u ON u.id=r.handled_by")->fetchAll()]);}
