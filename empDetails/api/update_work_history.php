<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed.', 405);
    }

    $viewerEmployeeNumber = getCurrentEmployeeNumber($connkdt);

    $workHistId = isset($_POST['work_histID']) ? (int)$_POST['work_histID'] : 0;
    $startMonthYear = isset($_POST['date_monthYearStart']) ? trim((string)$_POST['date_monthYearStart']) : '';
    $endMonthYear = isset($_POST['date_monthYearEnd']) ? trim((string)$_POST['date_monthYearEnd']) : '';
    $companyName = isset($_POST['comp_name']) ? trim((string)$_POST['comp_name']) : '';
    $companyBusiness = isset($_POST['comp_business']) ? trim((string)$_POST['comp_business']) : '';
    $businessContent = isset($_POST['business_cont']) ? trim((string)$_POST['business_cont']) : '';
    $workLocation = isset($_POST['work_loc']) ? trim((string)$_POST['work_loc']) : '';

    updateEmployeeWorkHistory(
        $connpcs,
        $connnew,
        $connkdt,
        $viewerEmployeeNumber,
        $workHistId,
        $startMonthYear,
        $endMonthYear,
        $companyName,
        $companyBusiness,
        $businessContent,
        $workLocation
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

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('update_work_history failed: ' . $e->getMessage());
    jsonError('Failed to update work history.', 500);
}