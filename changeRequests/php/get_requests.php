<?php
#region DB Connect
require_once '../../dbconn/dbconnectnew.php';
require_once '../../dbconn/dbconnectpcs.php';
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../global/globalFunctions.php';
require_once '../../helpers/env.php';
require_once '../../helpers/reentry_permit.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$result = [
    "isSuccess" => FALSE,
    "message" => "",
    "data" => [
        "date_change" => [],
        "cancellation" => [],
    ],
];
$userID = 0;
#endregion

#region get data values
$userID = getID();
if ($userID === 0) {
    $result["message"] = "Not logged in";
    die(json_encode($result));
}
if (!checkRequestListAccess($userID)) {
    $result["message"] = "Not authorized";
    die(json_encode($result));
}
$membersStatement = "";
$groupMembers = getMembers($userID);
if (count($groupMembers) > 0) {
    $implodeString = implode("','", array_values($groupMembers));
    $membersStatement = "AND `rl`.emp_number IN ('" . $implodeString . "')";
}
#endregion

#region main query
try {
    $requestQ = "SELECT
            `rcl`.change_request_id,
            `rcl`.request_id,
            `rcl`.change_type,
            `rcl`.status,
            `rcl`.original_start_date,
            `rcl`.original_end_date,
            `rcl`.requested_start_date,
            `rcl`.requested_end_date,
            `rcl`.reason,
            `rcl`.requested_by,
            `rcl`.requested_at,
            `rcl`.date_modified,
            `rl`.emp_number,
            `rl`.location_id,
            `rl`.specific_loc,
            `ll`.location_name,
            `el`.group_id,
            `gl`.name AS group_name,
            `gll`.name AS requester_group,
            `pd`.passport_expiry,
            `vd`.visa_expiry,
            `rd`.emp_number AS reentry_emp_id,
            `rd`.permit_expiry,
            `rd`.on_process AS reentry_on_process
        FROM `pcosdb`.request_change_list rcl
        JOIN `pcosdb`.request_list rl
            ON `rl`.request_id = `rcl`.request_id
        JOIN `kdtphdb_new`.employee_list el
            ON `rl`.emp_number = `el`.id
        LEFT JOIN `passport_details` pd
            ON `pd`.emp_number = `el`.id
        LEFT JOIN `kdtphdb_new`.group_list gl
            ON `el`.group_id = `gl`.id
        LEFT JOIN `pcosdb`.khi_details kd
            ON `kd`.number = `rcl`.requested_by
        LEFT JOIN `kdtphdb_new`.group_list gll
            ON `kd`.group_id = `gll`.id
        LEFT JOIN `pcosdb`.location_list ll
            ON `rl`.location_id = `ll`.location_id
        LEFT JOIN `visa_details` vd
            ON `vd`.emp_number = `el`.id
        LEFT JOIN `reentry_permit_details` rd
            ON `rd`.emp_number = `el`.id
        WHERE `rl`.emp_number != 0
        $membersStatement
        ORDER BY `rcl`.requested_at DESC";

    $requestStmt = $connpcs->prepare($requestQ);
    $requestStmt->execute();

    if ($requestStmt->rowCount() > 0) {
        $requestArr = $requestStmt->fetchAll();

        foreach ($requestArr as $req) {
            $changeRequestId = (int)$req['change_request_id'];
            $originalRequestId = (int)$req['request_id'];
            $empnum = (int)$req['emp_number'];
            $requesterID = (int)$req['requested_by'];
            $changeType = $req['change_type'];
            $status = strtolower(trim((string)$req['status']));

            $specificLoc = $req['specific_loc'];
            $locationName = $req['location_name'];
            $locationLabel = trim($specificLoc . ($specificLoc && $locationName ? ', ' : '') . $locationName);

            $originalEnd = $req['original_end_date'];
            $passExp = $req['passport_expiry'];
            $visaExp = $req['visa_expiry'];
            $passValidity = $passExp && strtotime($passExp) >= strtotime($originalEnd);
            $visaValidity = $visaExp && strtotime($visaExp) >= strtotime($originalEnd);
            $reentryStatus = resolveReentryPermitStatus(
                $req['reentry_emp_id'] !== null && $req['reentry_emp_id'] !== '',
                $req['reentry_on_process'] ?? 0,
                $req['permit_expiry'] ?? null
            );

            if ($changeType === 'date_change') {
                $prefix = 'DC';
            } else {
                $prefix = 'CR';
            }

            $output = [
                "req_id" => $changeRequestId,
                "display_id" => $prefix . '-' . str_pad((string)$changeRequestId, 5, '0', STR_PAD_LEFT),
                "original_request_id" => $originalRequestId,
                "change_type" => $changeType,
                "emp_name" => getName($empnum),
                "emp_number" => $empnum,
                "group_id" => (int)$req['group_id'],
                "group_name" => $req['group_name'],
                "specific_loc" => $specificLoc,
                "location" => $locationLabel,
                "location_id" => (int)$req['location_id'],
                "requester_name" => getName($requesterID),
                "requester_group" => $req['requester_group'],
                "req_date" => date("Y-m-d", strtotime($req['requested_at'])),
                "old_date" => $req['original_start_date'],
                "old_date_to" => $req['original_end_date'],
                "new_date" => $req['requested_start_date'],
                "new_date_to" => $req['requested_end_date'],
                "from" => $req['original_start_date'],
                "to" => $req['original_end_date'],
                "duration" => countDays($req['original_start_date'], $originalEnd),
                "reason" => $req['reason'],
                "status" => $status,
                "passValid" => (bool)$passValidity,
                "visaValid" => (bool)$visaValidity,
                "reentryStatus" => $reentryStatus,
                "modified" => $req['date_modified'],
            ];

            if ($changeType === 'date_change') {
                $result['data']['date_change'][] = $output;
            } elseif ($changeType === 'cancellation') {
                $result['data']['cancellation'][] = $output;
            }
        }
    }

    $result["isSuccess"] = TRUE;
} catch (Exception $e) {
    $result["isSuccess"] = FALSE;
    $result["message"] = "Connection failed: " . $e->getMessage();
}
#endregion
echo json_encode($result);
