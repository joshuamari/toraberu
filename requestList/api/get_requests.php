<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);
    $requests = getRequestList($connpcs, $connnew, $connkdt, $employeeNumber);

    jsonSuccess($requests, 'Request list loaded successfully.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if ($message === 'Not authorized.' || $message === 'Access denied.') {
        jsonError($message, 403);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('requestList/api/get_requests.php failed: ' . $e->getMessage());
    jsonError('Failed to load request list.', 500);
}