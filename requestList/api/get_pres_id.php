<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    if (!hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION)) {
        jsonError('Not authorized.', 403);
    }

    $presIds = getPresidentIds($connnew);

    jsonSuccess($presIds, 'President IDs loaded successfully.');
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
    error_log('requestList/api/get_pres_id.php failed: ' . $e->getMessage());
    jsonError('Failed to load president IDs.', 500);
}