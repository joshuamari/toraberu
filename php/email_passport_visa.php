<?php
#region DB Connect
require_once '../dbconn/dbconnectpcs.php';
require_once '../dbconn/dbconnectkdtph.php';
require_once '../dbconn/dbconnectnew.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize variables
$adminMembers = $members = [];
$headers = $subject = $adminEmails = "";
#endregion

#region main function
try {
    $getAdmin = "SELECT `email` FROM `employee_list` WHERE `group_id` = 2 AND (`designation` != 29 AND `designation` != 40 AND `designation` != 43 AND `designation` 
    != 44 AND `designation` != 45 AND `designation` != 49 AND `designation` != 51 AND `designation` != 53 AND `designation` != 50)";
    $getAdminStmt = $connnew->prepare($getAdmin);
    $getAdminStmt->execute([]);
    $members = $getAdminStmt->fetchAll();

    foreach ($members as $admin) {
        $email = $admin['email'];
        if (!empty($email)) {
            array_push($adminMembers, $email);
        }
    }
    $adminEmails = implode(", ", $adminMembers);

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: kdtreminder@global.kawasaki.com" . "\r\n";
    $headers .= "CC: " . $adminEmails;
    $subject = 'Expiring Passport/VISA Alert';

    $expiryPassQ = "SELECT ed.email as empEmail, TIMESTAMPDIFF(DAY, CURDATE(), pd.passport_expiry) AS expiringIn, pd.passport_expiry as expiringDate, pd.passport_number as 
    idNum FROM kdtphdb_new.employee_list as ed LEFT JOIN passport_details as pd ON ed.id = pd.emp_number WHERE pd.passport_expiry >= CURDATE() AND pd.passport_expiry <= 
    DATE_ADD(CURDATE(), INTERVAL 9 MONTH)";
    $expiryPassStmt = $connpcs->prepare($expiryPassQ);
    $expiryPassStmt->execute([]);
    if ($expiryPassStmt->rowCount() > 0) {
        $type = "passport";
        $expiryPass = $expiryPassStmt->fetchAll();
        $sendDays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270];
        sendEmail($expiryPass, $sendDays, $type);
    }

    $expiryVisaQ = "SELECT ed.email as empEmail, TIMESTAMPDIFF(DAY, CURDATE(), vd.visa_expiry) AS expiringIn, vd.visa_expiry as expiringDate, vd.visa_number as 
    idNum FROM kdtphdb_new.employee_list as ed LEFT JOIN visa_details as vd ON ed.id = vd.emp_number WHERE vd.visa_expiry >= CURDATE() AND vd.visa_expiry <= 
    DATE_ADD(CURDATE(), INTERVAL 6 MONTH)";
    $expiryVisaStmt = $connpcs->prepare($expiryVisaQ);
    $expiryVisaStmt->execute([]);
    if ($expiryVisaStmt->rowCount() > 0) {
        $type = "visa";
        $expiryVisa = $expiryVisaStmt->fetchAll();
        $sendDays = [0, 30, 60, 90, 120, 150, 180];
        sendEmail($expiryVisa, $sendDays, $type);
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion


function sendEmail($expiryID, $sendDays, $type)
{
    global $headers, $subject;
    foreach ($expiryID as $val) {
        $expiringIn = $val["expiringIn"];
        $expiringDate = $val["expiringDate"];
        $email = $val["empEmail"];
        $idNum = $val["idNum"];

        if (in_array($expiringIn, $sendDays)) {
            $expiringDate = strtotime($expiringDate);
            $expiringDate = date("d M Y", $expiringDate);
            $message = "Your " . $type . " with number " . $idNum . " will be expiring in " . $expiringDate;
            if ($expiringIn == 0) {
                $message = "Your " . $type . " with number " . $idNum . " will be expiring today";
            }

            if (mail($email, $subject, $message, $headers)) {
                echo "success " . $expiringIn . " " . $email;
            } else {
                echo "fail on sending email";
            }
        } else {
            echo "fail " . $expiringIn . " " . $email;
        }
    }
}
