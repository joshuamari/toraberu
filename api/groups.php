<?php

require_once __DIR__ . '/../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        jsonError('Access denied.', 403);
    }

    $groups = getAccessibleGroups($connnew, $connkdt, $employeeNumber);

    jsonSuccess($groups, 'Groups loaded successfully.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('api/groups.php failed: ' . $e->getMessage());
    jsonError('Failed to load groups.', 500);
}