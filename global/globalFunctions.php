<?php
#region Functions
function checkOverlap($empnum, $range)
{
    global $connpcs;
    $isOverlap = false;
    $starttime = $range['start'];
    $endtime = $range['end'];
    $dispatchQ = "SELECT * FROM `dispatch_list` WHERE `emp_number` = :empnum AND((`dispatch_from` BETWEEN :starttime AND :endtime OR `dispatch_to` BETWEEN :starttime AND :endtime) OR(:starttime BETWEEN `dispatch_from` AND `dispatch_to` OR :endtime BETWEEN `dispatch_from` AND `dispatch_to`))";
    $dispatchStmt = $connpcs->prepare($dispatchQ);
    $dispatchStmt->execute([":empnum" => $empnum, ":starttime" => $starttime, ":endtime" => $endtime]);
    if ($dispatchStmt->rowCount() > 0) {
        $isOverlap = true;
    }

    return $isOverlap;
}

function checkAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 36;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}

function checkEditAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 37;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}

function alLGroupAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 42;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}

function getMembers($empnum)
{
    global $connnew;
    $members = array();
    $yearMonth = date("Y-m-01");
    $myGroups = getGroups($empnum);
    foreach ($myGroups as $grp) {
        $memsQ = "SELECT `id` FROM `employee_list` WHERE `group_id` = :grp AND (`resignation_date` IS NULL OR `resignation_date` = '0000-00-00' OR `resignation_date` > :yearMonth) 
        AND `nickname` <> ''";
        $memsStmt = $connnew->prepare($memsQ);
        $memsStmt->execute([":grp" => $grp, ":yearMonth" => $yearMonth]);
        if ($memsStmt->rowCount() > 0) {
            $memArr = $memsStmt->fetchAll();
            $arrValues = array_column($memArr, "id");
            $members = array_merge($members, $arrValues);
        }
    }
    return $members;
}

function getGroups($empnum)
{
    global $connnew;
    $allGroupAccess = alLGroupAccess($empnum);
    $myGroups = array();
    if (!$allGroupAccess) {
        $groupsQ = "SELECT `group_id` FROM `employee_group` WHERE `employee_number` = :empnum";
        $groupsStmt = $connnew->prepare($groupsQ);
        $groupsStmt->execute([":empnum" => $empnum]);
        if ($groupsStmt->rowCount() > 0) {
            $groupArr = $groupsStmt->fetchAll();
            foreach ($groupArr as $grp) {
                $group = $grp['group_id'];
                array_push($myGroups, $group);
            }
        }
    } else {
        $groupsQ = "SELECT `id` FROM `group_list`";
        $groupsStmt = $connnew->prepare($groupsQ);
        $groupsStmt->execute();
        if ($groupsStmt->rowCount() > 0) {
            $groupArr = $groupsStmt->fetchAll();
            foreach ($groupArr as $grp) {
                $group = $grp['id'];
                array_push($myGroups, $group);
            }
        }
    }
    return $myGroups;
}

function getID()
{
    global $connpcs;
    $empID = 0;

    if (!empty($_COOKIE["userID"])) {
        $userHash = $_COOKIE["userID"];
    }
    $empidQ = "SELECT fldEmployeeNum as empID FROM kdtphdb.kdtlogin WHERE fldUserHash = :userHash";
    $empidStmt = $connpcs->prepare($empidQ);
    $empidStmt->execute([":userHash" => "$userHash"]);
    if ($empidStmt->rowCount() > 0) {
        $empID = $empidStmt->fetchColumn();
    }
    return $empID;
}
function getName($id)
{
    global $connnew;
    global $connpcs;
    $name = '';
    $newQ = "SELECT CONCAT(`surname`,', ',`firstname`) FROM `employee_list` WHERE `id`=:id";
    $newStmt = $connnew->prepare($newQ);
    $newStmt->execute([":id" => $id]);
    if ($newStmt->rowCount() > 0) {
        $name = $newStmt->fetchColumn();
    } else {
        $pcsQ = "SELECT CONCAT(`surname`,', ',`firstname`) FROM `khi_details` WHERE `number`=:id";
        $pcsStmt = $connpcs->prepare($pcsQ);
        $pcsStmt->execute([":id" => $id]);
        if ($pcsStmt->rowCount() > 0) {
            $name = $pcsStmt->fetchColumn();
        }
    }

    return ucwords(strtolower($name));
}
function getPresID()
{
    global $connnew;
    $arrayID = [];
    $idp = 0;
    $idQ = "SELECT `id` FROM `employee_list` WHERE `designation`=29 AND `resignation_date` < CURRENT_DATE()";
    $idStmt = $connnew->query($idQ);
    if ($idStmt->rowCount() > 0) {
        $idp = $idStmt->fetchColumn();
        $arrayID[] = (int)$idp;
    }
    return $arrayID;
}
function getPresEmail()
{
    global $connnew;
    $emailp = '';
    $emailQ = "SELECT `email` FROM `employee_list` WHERE `designation`=29 AND `resignation_date` < CURRENT_DATE()";
    $emailStmt = $connnew->query($emailQ);
    if ($emailStmt->rowCount() > 0) {
        $emailp = $emailStmt->fetchColumn();
    }
    return $emailp;
}
function getAdminEmails()
{
    global $connnew;
    $adminEmail = array();
    $exclude = [29, 40, 43, 44, 45, 49, 51, 53];
    $adminGroupID = 2;
    $excludeStmt = "AND `designation` NOT IN (" . implode(",", $exclude) . ")";
    $emailQ = "SELECT `email` FROM `employee_list` WHERE `group_id`=:group_id $excludeStmt";
    $emailStmt = $connnew->prepare($emailQ);
    $emailStmt->execute([":group_id" => $adminGroupID]);
    if ($emailStmt->rowCount() > 0) {
        $emailArr = $emailStmt->fetchAll();
        foreach ($emailArr as $emails) {
            $adminEmail[] = $emails['email'];
        }
    }
    return $adminEmail;
}
function groupByID($id)
{
    global $connnew;
    $grpID = 0;
    $grpQ = "SELECT `group_id` FROM `employee_list` WHERE `id`=:id";
    $grpStmt = $connnew->prepare($grpQ);
    $grpStmt->execute([":id" => $id]);
    if ($grpStmt->rowCount() > 0) {
        $grpID = $grpStmt->fetchColumn();
    }
    return $grpID;
}
function getKHIPICEmail($group_id, $exclude = 0)
{
    global $connpcs;
    $khiEmail = array();
    $khiQ = "SELECT `email` FROM `khi_details` WHERE `group_id`=:group_id AND `number` != :exclude";
    $khiStmt = $connpcs->prepare($khiQ);
    $khiStmt->execute([":group_id" => $group_id, ":exclude" => $exclude]);
    if ($khiStmt->rowCount() > 0) {
        $khiArr = $khiStmt->fetchAll();
        foreach ($khiArr as $emails) {
            $khiEmail[] = $emails['email'];
        }
    }
    return $khiEmail;
}
function getKHIAdminEmails()
{
    global $connpcs;
    $khiEmail = array();
    $khiQ = "SELECT `email` FROM `khi_details` WHERE `group_id`=2 AND `number` != 905007";
    $khiStmt = $connpcs->prepare($khiQ);
    $khiStmt->execute();
    if ($khiStmt->rowCount() > 0) {
        $khiArr = $khiStmt->fetchAll();
        foreach ($khiArr as $emails) {
            $khiEmail[] = $emails['email'];
        }
    }
    return $khiEmail;
}
function getRequestDetails($request_id)
{
    global $connpcs;
    $details = array();
    $detailsQ = "SELECT * FROM `request_list` WHERE `request_id`=:request_id";
    $detailsStmt = $connpcs->prepare($detailsQ);
    $detailsStmt->execute([":request_id" => $request_id]);
    $details = $detailsStmt->fetch();
    $details['emp_group'] = groupByID($details['emp_number']);
    return $details;
}
function getKHIUserDetails($id)
{
    global $connpcs;
    $khidetails = array();
    $khidQ = "SELECT `surname`,`email` FROM `khi_details` WHERE `number`=:id";
    $khidStmt = $connpcs->prepare($khidQ);
    $khidStmt->execute([":id" => $id]);
    $khidetails = $khidStmt->fetch();
    return $khidetails;
}
function getLocationName($id)
{
    global $connpcs;
    $name = '';
    $nameQ = "SELECT `location_name` FROM `location_list` WHERE `location_id`=:id";
    $nameStmt = $connpcs->prepare($nameQ);
    $nameStmt->execute([":id" => $id]);
    $name = $nameStmt->fetchColumn();
    return $name;
}
function emailStatusChange($status, $details)
{
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: kdt_toraberu@global.kawasaki.com" . "\r\n";
    $subject = 'Dispatch Request Status(TEST ONLY)';
    $khidetails = getKHIUserDetails($details['requester_id']);

    #region TESTING

    #region systesting
    $CCarray = array('medrano_c-kdt@global.kawasaki.com', 'hernandez-kdt@global.kawasaki.com', 'reyes_d-kdt@global.kawasaki.com', 'cabiso-kdt@global.kawasaki.com', 'coquia-kdt@global.kawasaki.com');
    #endregion

    #region prekhitesting
    // $admins = array("sangalang_m-kdt@global.kawasaki.com");
    // $khipic = getKHIPICEmail($details['emp_group'], $details['requester_id']);
    // $khiAdmins = getKHIAdminEmails($details['requester_id']);
    // $kdtManagers = array("lazaro-kdt@global.kawasaki.com");
    // $CCarray = array_unique(array_merge($admins, $khipic, $khiAdmins, $kdtManagers));
    // $CCarray[] = "hernandez-kdt@global.kawasaki.com";
    #endregion
    #endregion

    #region PROD
    // $admins = getAdminEmails();
    // $khipic = getKHIPICEmail($details['emp_group'], $details['requester_id']);
    // $khiAdmins = getKHIAdminEmails($details['requester_id']);
    // $kdtManagers = getGroupManagersEmail($details['emp_group']);
    // $CCarray = array_unique(array_merge($khipic, $khiAdmins, $kdtManagers, $admins));
    // $CCarray[] = getPresEmail();
    // $CCarray = array_reverse($CCarray);
    #endregion
    $CC = implode(",", $CCarray);
    $statusString = $status ? "accepted" : "cancelled";
    $headers .= "CC: " . $CC;
    $msg = "
                <html>
                <head>
                <title>Dispatch Request</title>
                </head>
                <body>
        <p>Dear " . ucwords(strtolower($khidetails['surname'])) . "-san,</p>
        <p>We are writing to inform you that your request has been $statusString.</p>
        <p>Details:</p>
        <p>Employee: " . getName($details['emp_number']) . "</p>
        <p>Date From: " . $details['dispatch_from'] . "</p>
        <p>Date To: " . $details['dispatch_to'] . "</p>
        <p>Location: " . getLocationName($details['location_id']) . "</p>
        <p>Date Requested: " . $details['date_requested'] . "</p>
        <br>
        <p>For <strong>KDT</strong>, review the request details:</p>
        <ul>
            <li><a href='http://kdt-ph/PCS/requestList/'>Dispatch Request List</a></li>
        </ul>
        <p>For <strong>KHI</strong>, track the request status:</p>
        <ul>
            <li><a href='http://kdt-ph/PCSKHI/requestList/'>Track Request Status</a></li>
        </ul>
        <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
        <p>Best regards,</p>
        <p>トラベる<br>KHI Design & Technical Service, Inc.</p>
         <p style='margin-top: 20px; font-size: 12px; color: #999;'>Please do not reply to this email as it is system generated.</p>
                </body>
                </html>
            ";
    if (mail($khidetails['email'], $subject, $msg, $headers)) {
        return TRUE;
    } else {
        return FALSE;
    }
    //baguhin yung $CCarray pag prod na.
}
function countDays($start, $end)
{
    $date1 = date_create($start);
    $date2 = date_create($end);
    $diff = date_diff($date1, $date2);
    return  (int)$diff->format("%a") + 1;
}
function checkRequestListAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 43;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}
function getWorkHistory($id)
{
    global $connpcs;
    $workHistory = array();
    $workQ = "SELECT * FROM `work_history` WHERE `emp_id`=:id ORDER BY `start_date`";
    $workStmt = $connpcs->prepare($workQ);
    $workStmt->execute([":id" => $id]);
    if ($workStmt->rowCount() > 0) {
        $workArr = $workStmt->fetchAll();
        foreach ($workArr as $work) {
            $output = array();
            $output['company_name'] = $work['comp_name'];
            $output['company_business'] = $work['comp_business'];
            $output['business_content'] = $work['business_cont'];
            $output['location'] = $work['work_loc'];
            $output['start_year'] = date("Y", strtotime($work['start_date']));
            $output['start_month'] = date("n", strtotime($work['start_date']));
            $output['end_year'] = !empty($work['end_date']) ? date("Y", strtotime($work['end_date'])) : null;
            $output['end_month'] = !empty($work['end_date']) ? date("n", strtotime($work['end_date'])) : null;
            $workHistory[] = $output;
        }
    }
    return $workHistory;
}
function getGroupManagersEmail($group_id)
{
    global $connnew;
    $matik = [19, 55]; //GM & SM
    $matikStmt = implode(",", $matik);
    $mgs = [17, 18]; //AM & DM
    $mgsStmt = implode(",", $mgs);
    $mgEmail = array();
    $emailQ = "SELECT DISTINCT `el`.email FROM `employee_list` el LEFT JOIN `employee_group` eg ON `el`.id=`eg`.employee_number WHERE (`el`.designation IN ($matikStmt) OR (`el`.designation IN ($mgsStmt) AND `eg`.group_id=:group_id)) AND (`el`.`resignation_date`>CURDATE() OR `el`.`resignation_date` IS NULL OR `el`.`resignation_date`='0000-00-00')";
    $emailStmt = $connnew->prepare($emailQ);
    $emailStmt->execute([":group_id" => $group_id]);
    if ($emailStmt->rowCount() > 0) {
        $mgArr = $emailStmt->fetchAll();
        foreach ($mgArr as $mg) {
            $mgEmail[] = $mg['email'];
        }
    }
    return $mgEmail;
}
function getAllowance($id)
{
    global $connpcs;
    $allowance = array();
    $allowanceQ = "SELECT `location_id`,`amount` FROM `allowance_list` WHERE `level_id` = IFNULL((SELECT `da`.level_id FROM `pcosdb`.designation_allowance da JOIN `kdtphdb_new`.employee_list el ON `da`.designation_id=`el`.designation WHERE el.id=:id),1)";
    $allowanceStmt = $connpcs->prepare($allowanceQ);
    $allowanceStmt->execute([":id" => $id]);
    if ($allowanceStmt->rowCount() > 0) {
        $allowance = $allowanceStmt->fetchAll();
    }
    return $allowance;
}
function getCompanyByDept($dept_id)
{
    global $connpcs;
    $comp_id = 0;
    $compQ = "SELECT `comp_id` FROM requesters_dep WHERE `id`=:dept_id";
    $compStmt = $connpcs->prepare($compQ);
    $compStmt->execute([":dept_id" => $dept_id]);
    if ($compStmt->rowCount() > 0) {
        $comp_id = $compStmt->fetchColumn();
    }
    return $comp_id;
}
function getCompanyDetails($comp_id)
{
    global $connpcs;
    $company_details = [
        "company_jap" => "",
        "company_desc" => ""
    ];
    $compQ = "SELECT * FROM `company_list` WHERE `id`=:comp_id";
    $compStmt = $connpcs->prepare($compQ);
    $compStmt->execute([":comp_id" => $comp_id]);
    if ($compStmt->rowCount() > 0) {
        $company_details = $compStmt->fetch();
    }
    return $company_details;
}
#endregion
