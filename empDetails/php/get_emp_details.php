<?php
#region DB Connect
require_once '../../dbconn/dbconnectpcs.php';
require_once '../../dbconn/dbconnectnew.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$empID = 0;
#endregion

#region get data values
if (!empty($_POST["empID"])) {
    $empID = $_POST["empID"];
}
#endregion

#region main function
try {
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $link = $protocol . "://" . $host;
    $empQuery = "SELECT `id`, `surname` as lastname, `firstname`, `emp_status` as dispatch FROM `employee_list` 
    WHERE `id` = :empID";
    $empStmt = $connnew->prepare($empQuery);
    $empStmt->execute([":empID" => "$empID"]);
    $empDeets = $empStmt->fetch();

    $version = date("YmdHis");
    $yearNow = date("Y");

    $empDeets["pictureLink"] = "$link/QMS/Profilev2/defaultqmsphoto.png";
    for ($x = $yearNow; $x >= 2021; $x--) {
        $picLink = "C:/xampp/htdocs/QMS/Profilev2/" . $x . "/pic_" . $empDeets["id"] . ".jpg";
        if (file_exists($picLink)) {
            $empDeets["pictureLink"] = "$link/QMS/Profilev2/" . $x . "/pic_" . $empDeets["id"] . ".jpg?version=" . $version;
            break;
        }
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($empDeets);
