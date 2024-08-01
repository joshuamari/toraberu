<?php
#region DB Connect
require_once '../dbconn/dbconnectpcs.php';
require_once '../dbconn/dbconnectkdtph.php';
require_once 'globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$userHash = "";
$empDetails = array();
$result = array();
#endregion

#region get data values
if (!empty($_COOKIE["userID"])) {
    $userHash = $_COOKIE["userID"];
} else {
    $result["isSuccess"] = false;
    $result["message"] = "Not logged in";
    echo json_encode($result);
    die();
}
#endregion

//36 is access ID
//37 is modify ID
#region main function
try {
    $empQ = "SELECT ep.fldEmployeeNum, ep.fldSurname, ep.fldFirstname,kb.fldBUName  FROM `kdtlogin` AS kl JOIN `emp_prof` AS ep ON kl.fldEmployeeNum=ep.fldEmployeeNum JOIN `kdtbu` AS kb ON ep.fldGroup=kb.fldBU WHERE kl.fldUserHash = :userHash";
    $empStmt = $connkdt->prepare($empQ);
    $empStmt->execute([":userHash" => "$userHash"]);
    if ($empStmt->rowCount() > 0) {
        $emp = $empStmt->fetch();
        $empnum = $emp["fldEmployeeNum"];
        $surname = $emp["fldSurname"];
        $firstname = $emp["fldFirstname"];
        $groupname = $emp["fldBUName"];
        $empDetails["id"] = $empnum;
        $empDetails["empname"]["firstname"] = $firstname;
        $empDetails["empname"]["surname"] = $surname;
        $empDetails["group"] = $groupname;


        $editAccess = checkEditAccess($empnum);
        $empDetails["edit"] = $editAccess;
        $userAccess = checkAccess($empnum);
        $requestAccess = checkRequestListAccess($empnum);
        $empDetails["request"] = $requestAccess;
        if ($userAccess) {
            $result["isSuccess"] = true;
            $result["data"] = $empDetails;
        } else {
            $result["isSuccess"] = false;
            $result["message"] = "Access denied";
        }
    } else {
        $result["isSuccess"] = false;
        $result["message"] = "User not found";
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);
