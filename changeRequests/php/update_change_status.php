<?php
#region Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods');
#endregion

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
$devs = [464, 487, 510, 518, 521];
$presID = getPresID();
$devs = array_merge($presID, $devs);
$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    $data = [];
}
$empty = [];
$input = [];
$required_fields = ['change_request_id', 'action'];
foreach ($required_fields as $field) {
    if (isset($data[$field]) && $data[$field] !== '') {
        $input[$field] = html_entity_decode((string)$data[$field], ENT_QUOTES, 'UTF-8');
    } else {
        $empty[] = ucfirst(str_replace('_', ' ', $field));
    }
}
$changeRequestId = isset($input['change_request_id']) ? (int)$input['change_request_id'] : 0;
$action = isset($input['action']) ? strtolower(trim($input['action'])) : '';
$currentDatetime = date("Y-m-d H:i:s");
#endregion

#region validations
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    $result['message'] = 'Method not allowed';
    die(json_encode($result));
}
if (count($empty)) {
    $lastElement = array_pop($empty);
    $emptyMessage = implode(", ", $empty);
    if (!empty($emptyMessage)) {
        $emptyMessage .= ", and ";
    }
    $emptyMessage .= $lastElement . " cannot be empty";
    $result['message'] = $emptyMessage;
    die(json_encode($result));
}
if ($userID === 0) {
    $result["message"] = "Not logged in";
    die(json_encode($result));
}
if (!in_array((int)$userID, array_map('intval', $devs), true)) {
    $result["message"] = "Not authorized";
    die(json_encode($result));
}
if (!in_array($action, ['approve', 'deny'], true)) {
    $result["message"] = "Invalid action. Use approve or deny.";
    die(json_encode($result));
}
#endregion

#region main function
try {
    $changeQ = "SELECT
            `rcl`.*,
            `rl`.request_status AS dispatch_status,
            `rl`.dispatch_from AS current_dispatch_from,
            `rl`.dispatch_to AS current_dispatch_to
        FROM `request_change_list` rcl
        JOIN `request_list` rl ON `rl`.request_id = `rcl`.request_id
        WHERE `rcl`.change_request_id = :change_request_id
        LIMIT 1";
    $changeStmt = $connpcs->prepare($changeQ);
    $changeStmt->execute([":change_request_id" => $changeRequestId]);

    if ($changeStmt->rowCount() < 1) {
        $result["message"] = "Change request not found";
        die(json_encode($result));
    }

    $change = $changeStmt->fetch(PDO::FETCH_ASSOC);
    $changeStatus = strtolower(trim((string)$change['status']));
    $changeType = strtolower(trim((string)$change['change_type']));
    $originalRequestId = (int)$change['request_id'];
    $dispatchStatus = $change['dispatch_status'];

    if ($changeStatus !== 'pending') {
        $result["message"] = "Only pending change requests can be updated";
        die(json_encode($result));
    }

    if (!in_array($changeType, ['date_change', 'cancellation'], true)) {
        $result["message"] = "Invalid change request type";
        die(json_encode($result));
    }

    $newStatus = $action === 'approve' ? 'approved' : 'declined';

    if ($action === 'approve') {
        if ((int)$dispatchStatus !== 1) {
            $result["message"] = "Original dispatch must be approved and active";
            die(json_encode($result));
        }

        if ($changeType === 'date_change') {
            if (empty($change['requested_start_date']) || empty($change['requested_end_date'])) {
                $result["message"] = "Requested dates are required for date change approval";
                die(json_encode($result));
            }
        }
    }

    $connpcs->beginTransaction();

    $updateChangeQ = "UPDATE `request_change_list`
        SET `status` = :status,
            `date_modified` = :date_modified
        WHERE `change_request_id` = :change_request_id
          AND `status` = 'pending'";
    $updateChangeStmt = $connpcs->prepare($updateChangeQ);
    $updateChangeStmt->execute([
        ":status" => $newStatus,
        ":date_modified" => $currentDatetime,
        ":change_request_id" => $changeRequestId,
    ]);

    if ($updateChangeStmt->rowCount() < 1) {
        $connpcs->rollBack();
        $result["message"] = "Failed to update change request status";
        die(json_encode($result));
    }

    if ($action === 'approve' && $changeType === 'date_change') {
        $updateRequestQ = "UPDATE `request_list`
            SET `dispatch_from` = :dispatch_from,
                `dispatch_to` = :dispatch_to,
                `date_modified` = :date_modified
            WHERE `request_id` = :request_id
              AND `request_status` = 1";
        $updateRequestStmt = $connpcs->prepare($updateRequestQ);
        $updateRequestStmt->execute([
            ":dispatch_from" => $change['requested_start_date'],
            ":dispatch_to" => $change['requested_end_date'],
            ":date_modified" => $currentDatetime,
            ":request_id" => $originalRequestId,
        ]);

        if ($updateRequestStmt->rowCount() < 1) {
            $connpcs->rollBack();
            $result["message"] = "Failed to update original dispatch dates";
            die(json_encode($result));
        }

        $dispatchId = getDispatchID($originalRequestId);
        if ($dispatchId !== null) {
            $updateDispatchQ = "UPDATE `dispatch_list`
                SET `dispatch_from` = :dispatch_from,
                    `dispatch_to` = :dispatch_to
                WHERE `dispatch_id` = :dispatch_id";
            $updateDispatchStmt = $connpcs->prepare($updateDispatchQ);
            $updateDispatchStmt->execute([
                ":dispatch_from" => $change['requested_start_date'],
                ":dispatch_to" => $change['requested_end_date'],
                ":dispatch_id" => $dispatchId,
            ]);

            if ($updateDispatchStmt->rowCount() < 1) {
                $connpcs->rollBack();
                $result["message"] = "Failed to update dispatch list dates";
                die(json_encode($result));
            }
        }
    }

    if ($action === 'approve' && $changeType === 'cancellation') {
        $updateRequestQ = "UPDATE `request_list`
            SET `request_status` = 0,
                `date_modified` = :date_modified
            WHERE `request_id` = :request_id
              AND `request_status` = 1";
        $updateRequestStmt = $connpcs->prepare($updateRequestQ);
        $updateRequestStmt->execute([
            ":date_modified" => $currentDatetime,
            ":request_id" => $originalRequestId,
        ]);

        if ($updateRequestStmt->rowCount() < 1) {
            $connpcs->rollBack();
            $result["message"] = "Failed to cancel original dispatch request";
            die(json_encode($result));
        }

        $dispatchId = getDispatchID($originalRequestId);
        if ($dispatchId !== null) {
            $deleteDispatchQ = "DELETE FROM `dispatch_list` WHERE `dispatch_id` = :dispatch_id";
            $deleteDispatchStmt = $connpcs->prepare($deleteDispatchQ);
            $deleteDispatchStmt->execute([":dispatch_id" => $dispatchId]);

            if ($deleteDispatchStmt->rowCount() < 1) {
                $connpcs->rollBack();
                $result["message"] = "Failed to remove dispatch list record";
                die(json_encode($result));
            }
        }
    }

    $connpcs->commit();

    $result["isSuccess"] = TRUE;
    $result["message"] = $action === 'approve'
        ? "Successfully approved"
        : "Successfully declined";
    $result["data"] = [
        "change_request_id" => $changeRequestId,
        "request_id" => $originalRequestId,
        "change_type" => $changeType,
        "status" => $newStatus,
        "action" => $action,
    ];
} catch (Exception $e) {
    if ($connpcs->inTransaction()) {
        $connpcs->rollBack();
    }
    $result["isSuccess"] = FALSE;
    $result["message"] = "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);
