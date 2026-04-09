<?php

require_once __DIR__ . '/../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        jsonError('Access denied.', 403);
    }

    $dispatchList = getDashboardDispatchList($connpcs, $connnew, $connkdt, $employeeNumber);

    jsonSuccess($dispatchList, 'Dispatch list loaded successfully.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if ($message === 'Access denied.') {
        jsonError($message, 403);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('api/get_dispatch_list.php failed: ' . $e->getMessage());
    jsonError('Failed to load dispatch list.', 500);
}