<?php

require_once __DIR__ . '/../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        jsonError('Access denied.', 403);
    }

    $expiringList = getExpiringPassports($connpcs, $connnew, $connkdt, $employeeNumber);

    jsonSuccess($expiringList, 'Expiring passport list loaded successfully.');
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
    error_log('api/get_expiring_passport.php failed: ' . $e->getMessage());
    jsonError('Failed to load expiring passport list.', 500);
}