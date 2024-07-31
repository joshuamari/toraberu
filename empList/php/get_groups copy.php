<?php
#region DB Connect
require_once '../../dbconn/dbconnectnew.php';
require_once '../../dbconn/dbconnectpcs.php';
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../global/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$groups = array();
#endregion

#region get data values
if (!empty($_COOKIE["userID"])) {
    $userHash = $_COOKIE["userID"];
}
#endregion

#region main query
try {
    $empidQ = "SELECT `fldEmployeeNum` as empID FROM kdtphdb.kdtlogin WHERE fldUserHash = :userHash";
    $empidStmt = $connpcs->prepare($empidQ);
    $empidStmt->execute([":userHash" => "$userHash"]);
    if ($empidStmt->rowCount() > 0) {
        $empID = $empidStmt->fetchColumn();
    }

    // $userQ = "SELECT COUNT(*) FROM kdtphdb.user_permissions WHERE permission_id = 42 AND fldEmployeeNum = :empID";
    // $userStmt = $connpcs->prepare($userQ);
    // $userStmt->execute([":empID" => "$empID"]);
    // $userCount = $userStmt->fetchColumn();
    $userCount = alLGroupAccess($empID);
    
    if ($userCount) {
        $groupQ = "SELECT `id` as `newID`, `name`, `abbreviation`, (SELECT COUNT(*) FROM employee_list WHERE `group_id` = `newID` AND `emp_status` = 1) as `empCount` 
        FROM group_list HAVING `empCount` > 0 ORDER BY `name`";
        $groupStmt = $connnew->prepare($groupQ);
        $groupStmt->execute([]);
        $groups = $groupStmt->fetchAll();
    } else {
        $groupQ = "SELECT gl.`id` as `newID`, gl.`name`, gl.`abbreviation` FROM employee_group as eg LEFT JOIN group_list as gl ON eg.`group_id` = gl.`id` 
        WHERE eg.`employee_number` = :empID  ORDER BY `name`";
        $groupStmt = $connnew->prepare($groupQ);
        $groupStmt->execute([":empID" => $empID]);
        $groups = $groupStmt->fetchAll();
    }

    foreach($groups as &$group) {
        $groupID = $group["newID"];

        $cipher = "AES-256-CBC";
        $encrypt = openssl_encrypt($groupID, $cipher, "PCSGROUPENC", 0, "HAHTASDFSDFT6634");
        // $decrypt = openssl_decrypt($encrypt, $cipher, "PCSGROUPENC", 0, "HAHTASDFSDFT6634");
        $group["newID"] = $encrypt;
    }

    echo json_encode($groups);
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

