<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);
    $employeeId = isset($_POST['empID']) ? (int)$_POST['empID'] : 0;

    $employee = getEmployeeBasicDetails(
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $employeeId
    );

    jsonSuccess($employee, 'Employee details loaded successfully.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if ($message === 'Access denied.') {
        jsonError($message, 403);
    }

    if ($message === 'Employee not found.') {
        jsonError($message, 404);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('empDetails/api/get_emp_details.php failed: ' . $e->getMessage());
    jsonError('Failed to load employee details.', 500);
}