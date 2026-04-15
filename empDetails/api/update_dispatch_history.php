<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);

    $dispatchID = isset($_POST['dispatchID']) ? (int)$_POST['dispatchID'] : 0;
    $dateFrom = isset($_POST['dateFrom']) ? trim((string)$_POST['dateFrom']) : '';
    $dateTo = isset($_POST['dateTo']) ? trim((string)$_POST['dateTo']) : '';
    $dispatchLoc = isset($_POST['locID']) ? (int)$_POST['locID'] : 0;

    updateDispatchRecord(
        $connpcs,
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $dispatchID,
        $dispatchLoc,
        $dateFrom,
        $dateTo
    );

    jsonSuccess(null, 'Update successful.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if ($message === 'Access denied.') {
        jsonError($message, 403);
    }

    if ($message === 'Dispatch not found.') {
        jsonError($message, 404);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('empDetails/api/update_dispatch_history.php failed: ' . $e->getMessage());
    jsonError('Failed to update dispatch history.', 500);
}