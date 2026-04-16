<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);

    $employeeId = isset($_POST['empID']) ? (int)$_POST['empID'] : 0;
    $number = isset($_POST['number']) ? trim((string)$_POST['number']) : '';
    $issued = isset($_POST['issued']) ? trim((string)$_POST['issued']) : '';
    $expiry = isset($_POST['expiry']) ? trim((string)$_POST['expiry']) : '';

    updateEmployeeVisa(
        $connpcs,
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $employeeId,
        $number,
        $issued,
        $expiry,
        $_FILES
    );

    jsonSuccess(null, 'Visa updated successfully.');
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
    error_log('update_visa failed: ' . $e->getMessage());
    jsonError('Failed to update visa.', 500);
}