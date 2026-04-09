<?php

function sendSystemEmail(string $to, string $subject, string $message, string $headers = ''): bool
{
    if (!isEmailEnabled()) {
        error_log("Email skipped because EMAIL_ENABLED=false. Subject: {$subject}");
        return false;
    }

    $forcedTo = trim((string)env('MAIL_FORCE_TO', ''));
    if ($forcedTo !== '') {
        $to = $forcedTo;
    }

    $forcedCc = trim((string)env('MAIL_FORCE_CC', ''));
    if ($forcedCc !== '') {
        $headers .= ($headers !== '' ? "\r\n" : '') . 'CC: ' . $forcedCc;
    }

    return mail($to, $subject, $message, $headers);
}