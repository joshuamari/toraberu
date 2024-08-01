<?php
#region DB Connect
require_once '../../dbconn/dbconnectpcs.php';
require_once '../../dbconn/dbconnectnew.php';
require_once '../../global/globalFunctions.php';
#endregion

#region Initialize Variable
$presID = 0;
$result = [
    "isSuccess" => FALSE,
    "message" => "",
    "data" => $presID
];
#endregion
try {
    // $presID = getPresID(); // UNCOMMENT KAPAG PROD
    $presID = 518; // COMMENT KAPAG PROD
    $result['isSuccess'] = TRUE;
    $result['data'] = $presID;
    $result['message'] = "Success";
} catch (PDOException $e) {
    $result['isSuccess'] = FALSE;
    $result['message'] = "Connection failed: " . $e->getMessage();
}
echo json_encode($result);
