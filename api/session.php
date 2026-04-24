<?php

require_once __DIR__ . '/../bootstrap.php';

try {
    $employeeNumber = getCurrentEmployeeNumber($connkdt);
    $sessionData = getSessionData($connkdt, $employeeNumber);

    jsonSuccess($sessionData, 'Session loaded successfully.');
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
    error_log('api/session.php failed: ' . $e->getMessage());
    jsonError('Failed to load session.', 500);
}