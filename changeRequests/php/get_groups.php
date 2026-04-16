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
$userID = 0;
$groups = array();
#endregion

#region get data values
$userID = getID();
#endregion

#region main query
try {

    $userCount = alLGroupAccess($userID);
    if ($userCount) {
        $groupQ = "SELECT `id` as `newID`, `name`, `abbreviation`, (SELECT COUNT(*) FROM kdtphdb_new.employee_group WHERE `group_id` = `newID`) as empCount 
        FROM kdtphdb_new.group_list HAVING empCount > 0 ORDER BY `name`";
        $groupStmt = $connpcs->prepare($groupQ);
        $groupStmt->execute([]);
        $groups = $groupStmt->fetchAll();
    } else {
        $groupQ = "SELECT gl.`id` as `newID`, gl.`name`, gl.`abbreviation` FROM employee_group as eg LEFT JOIN group_list as gl ON eg.`group_id` = gl.`id` 
        WHERE eg.`employee_number` = :empID  ORDER BY `name`";
        $groupStmt = $connnew->prepare($groupQ);
        $groupStmt->execute([":empID" => $userID]);
        $groups = $groupStmt->fetchAll();
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion
echo json_encode($groups);
