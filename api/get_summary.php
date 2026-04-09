<?php

require_once __DIR__ . '/../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        jsonError('Access denied.', 403);
    }

    $summary = getDashboardSummary($connpcs);

    jsonSuccess($summary, 'Summary loaded successfully.');
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
    error_log('api/get_summary.php failed: ' . $e->getMessage());
    jsonError('Failed to load summary.', 500);
}