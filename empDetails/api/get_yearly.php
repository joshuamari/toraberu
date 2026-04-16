<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);
    $employeeId = isset($_POST['empID']) ? (int)$_POST['empID'] : 0;

    $yearlyTotals = getEmployeeYearlyDispatchTotals(
        $connpcs,
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $employeeId
    );

    jsonSuccess($yearlyTotals, 'Yearly dispatch totals loaded successfully.');
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
    error_log('empDetails/api/get_yearly.php failed: ' . $e->getMessage());
    jsonError('Failed to load yearly dispatch totals.', 500);
}