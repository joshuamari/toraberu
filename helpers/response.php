<?php

function jsonSuccess($data = null, string $message = 'OK', int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
    ]);
    exit;
}

function jsonError(string $message = 'Request failed.', int $statusCode = 400, $data = null): void
{
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'data' => $data,
    ]);
    exit;
}