<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);
    $workHistId = isset($_POST['work_histID']) ? (int)$_POST['work_histID'] : 0;

    deleteEmployeeWorkHistory(
        $connpcs,
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $workHistId
    );

    jsonSuccess(null, 'Successfully deleted work history.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if ($message === 'Access denied.') {
        jsonError($message, 403);
    }

    if ($message === 'Work history not found.') {
        jsonError($message, 404);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('empDetails/api/delete_work_history.php failed: ' . $e->getMessage());
    jsonError('Failed to delete work history.', 500);
}