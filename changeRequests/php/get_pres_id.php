<?php
#region DB Connect
require_once '../../dbconn/dbconnectpcs.php';
require_once '../../dbconn/dbconnectnew.php';
require_once '../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->safeLoad();

require_once '../../services/ApprovalAccess.php';
#endregion

#region Initialize Variable
$result = [
    "isSuccess" => false,
    "message" => "",
    "data" => []
];
#endregion
try {
    $result['isSuccess'] = true;
    $result['data'] = getRequestApprovalAllowedIds($connnew);
    $result['message'] = "Success";
} catch (Throwable $e) {
    $result['isSuccess'] = false;
    $result['message'] = "Failed to load approval IDs.";
}
echo json_encode($result);
