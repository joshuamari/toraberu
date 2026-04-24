<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);

    $employeeId = isset($_POST['empID']) ? (int)$_POST['empID'] : 0;
    $isDetails = isset($_POST['isDetails']) 
        ? filter_var($_POST['isDetails'], FILTER_VALIDATE_BOOLEAN) 
        : false;

    $permit = getEmployeeReentryPermit(
        $connpcs,
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $employeeId,
        $isDetails
    );

    jsonSuccess($permit, 'Re-entry permit loaded successfully.');
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
    error_log('get_reentry_permit failed: ' . $e->getMessage());
    jsonError('Failed to load re-entry permit.', 500);
}