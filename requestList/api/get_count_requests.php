<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);
    $counts = getRequestCounts($connpcs, $connnew, $connkdt, $employeeNumber);

    jsonSuccess($counts, 'Request counts loaded successfully.');
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
    error_log('requestList/api/get_count_requests.php failed: ' . $e->getMessage());
    jsonError('Failed to load request counts.', 500);
}