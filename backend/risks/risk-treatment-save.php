<?php
// שומר או מסיר טיפול בסיכון יחד עם הערה ואחראי
if ($action === "risk-treatment-save") {
    $currentUser=admin();$key=trim((string)($data["risk_key"]??""));if($key==="")out(["error"=>"מזהה סיכון חסר"],422);
    if(empty($data["active"])){$query=db()->prepare("DELETE FROM risk_treatments WHERE risk_key=?");$query->execute([$key]);}
    else{$query=db()->prepare("INSERT INTO risk_treatments(risk_key,status,note,handled_by) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status),note=VALUES(note),handled_by=VALUES(handled_by),handled_at=NOW()");$query->execute([$key,$data["status"]??"acknowledged",trim((string)($data["note"]??""))?:null,$currentUser["id"]]);}
    log_activity("טיפול בסיכון","עודכן סיכון " . $key);out(["ok"=>true]);
}
