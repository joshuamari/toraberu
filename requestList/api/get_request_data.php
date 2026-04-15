<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);
    $requestId = isset($_GET['request_id']) ? (int)$_GET['request_id'] : 0;

    $requestData = getRequestDataById($connpcs, $connnew, $connkdt, $employeeNumber, $requestId);

    jsonSuccess($requestData, 'Request data loaded successfully.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if ($message === 'Not authorized.' || $message === 'Access denied.') {
        jsonError($message, 403);
    }

    if ($message === 'Request not found.') {
        jsonError($message, 404);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('requestList/api/get_request_data.php failed: ' . $e->getMessage());
    jsonError('Failed to load request data.', 500);
}