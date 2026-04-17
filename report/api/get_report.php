<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        jsonError('Access denied.', 403);
    }

    $selectedYear = isset($_POST['yearSelected']) ? trim((string)$_POST['yearSelected']) : date('Y');
    $encryptedGroupId = isset($_POST['groupID']) ? trim((string)$_POST['groupID']) : null;

    $report = getDispatchReport(
        $connpcs,
        $connnew,
        $connkdt,
        $employeeNumber,
        $selectedYear,
        $encryptedGroupId
    );

    jsonSuccess($report, 'Report loaded successfully.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if ($message === 'Access denied.') {
        jsonError($message, 403);
    }
    error_log('api/get_report.php failed: ' . $e->getMessage());
    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('api/get_report.php failed: ' . $e->getMessage());
    jsonError('Failed to load report.', 500);
}