<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    $groupId = isset($_POST['groupID']) ? trim((string)$_POST['groupID']) : null;
    $searchKey = isset($_POST['searchkey']) ? trim((string)$_POST['searchkey']) : '';

    $employees = getFilteredEmployees(
        $connpcs,
        $connnew,
        $connkdt,
        $employeeNumber,
        $groupId,
        $searchKey
    );

    jsonSuccess($employees, 'Employee list loaded successfully.');
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
    error_log('employeeList/api/get_employee_list.php failed: ' . $e->getMessage());
    jsonError('Failed to load employee list.', 500);
}