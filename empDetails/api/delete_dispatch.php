<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);
    $dispatchId = isset($_POST['dispatchID']) ? (int)$_POST['dispatchID'] : 0;

    if ($dispatchId <= 0) {
        jsonError('Invalid dispatch ID.', 400);
    }

    deleteDispatchRecord(
        $connpcs,
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $dispatchId
    );

    jsonSuccess(null, 'Deleted successfully.');
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
    error_log('empDetails/api/delete_dispatch.php failed: ' . $e->getMessage());
    jsonError('Failed to delete dispatch.', 500);
}