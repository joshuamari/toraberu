<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        jsonError('Method not allowed.', 405);
    }

    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        jsonError('Access denied.', 403);
    }

    $locations = getAllLocations($connpcs);

    jsonSuccess($locations, 'Locations loaded successfully.');
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('empDetails/api/get_location.php failed: ' . $e->getMessage());
    jsonError('Failed to load locations.', 500);
}