<?php

require_once __DIR__ . '/../../bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        jsonError('Method not allowed.', 405);
    }

    $employeeNumber = getCurrentEmployeeNumber($connkdt);

    $input = json_decode(file_get_contents("php://input"), true);

    if (!is_array($input)) {
        jsonError('Invalid JSON payload.', 400);
    }

    $status = isset($input['request_status']) ? (int)$input['request_status'] : null;
    $requestId = isset($input['request_id']) ? (int)$input['request_id'] : 0;

    if ($requestId <= 0) {
        jsonError('Invalid request ID.', 400);
    }

    updateRequestStatus($connpcs, $connnew, $connkdt, $employeeNumber, $requestId, $status);

    $text = $status === 1 ? 'approved' : 'denied';

    jsonSuccess(null, "Successfully {$text}.");
} catch (RuntimeException $e) {
    $message = $e->getMessage();

    if ($message === 'Not logged in.' || $message === 'User not found.') {
        jsonError($message, 401);
    }

    if (
        $message === 'Not authorized.' ||
        $message === 'Not authorized to update request status.'
    ) {
        jsonError($message, 403);
    }

    if ($message === 'Request not found.') {
        jsonError($message, 404);
    }

    jsonError($message, 400);
} catch (Throwable $e) {
    error_log('update_status failed: ' . $e->getMessage());
    jsonError('Failed to update request status.', 500);
}