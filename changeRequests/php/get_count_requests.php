<?php
//headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

#region DB Connect
require_once '../../dbconn/dbconnectpcs.php';
require_once '../../dbconn/dbconnectnew.php';
require_once '../../global/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$result = [
    "isSuccess" => FALSE,
    "message" => "",
    "data" => array()
];
$userID = getID();
#endregion

#region validations
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $result['message'] = 'Method not allowed';
    die(json_encode($result));
}
#endregion

#region main function
try {
    $getQ = "SELECT
            COUNT(CASE WHEN `status` = 'pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN `status` = 'approved' THEN 1 END) AS accepted,
            COUNT(CASE WHEN `status` = 'declined' THEN 1 END) AS cancelled,
            COUNT(CASE WHEN DATE(`requested_at`) = CURDATE() THEN 1 END) AS todaytotal,
            COUNT(CASE WHEN `status` = 'approved' AND DATE(`date_modified`) = CURDATE() THEN 1 END) AS todayaccept,
            COUNT(*) AS total
        FROM `request_change_list`";
    $getStmt = $connpcs->query($getQ);
    if ($getStmt->rowCount() > 0) {
        $countArr = $getStmt->fetch();
        $result['isSuccess'] = TRUE;
        $result['data']['pending'] = $countArr['pending'];
        $result['data']['accepted'] = $countArr['accepted'];
        $result['data']['cancelled'] = $countArr['cancelled'];
        $result['data']['todaytotal'] = $countArr['todaytotal'];
        $result['data']['todayaccept'] = $countArr['todayaccept'];
        $result['data']['total'] = $countArr['total'];
    } else {
        $result['message'] = '0 results';
    }
} catch (PDOException $e) {
    $result['isSuccess'] = FALSE;
    $result['message'] = "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);
