<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

function getEmailMode(): string
{
    return strtolower(trim((string)env('EMAIL_MODE', 'off')));
}

function extractCcFromHeaders(string $headers): array
{
    $cc = [];

    if (preg_match('/^CC:\s*(.+)$/mi', $headers, $matches)) {
        $cc = array_map('trim', explode(',', $matches[1]));
    }

    return array_filter($cc);
}

function sendSystemEmail(string $to, string $subject, string $message, string $headers = ''): bool
{
    $mode = getEmailMode();

    $originalTo = array_map('trim', explode(',', $to));
    $originalCc = extractCcFromHeaders($headers);

    // OFF MODE → log only
    if (!isEmailEnabled() || $mode === 'off') {
        error_log("EMAIL OFF MODE");
        error_log("Subject: {$subject}");
        error_log("To: " . implode(',', $originalTo));
        error_log("CC: " . (!empty($originalCc) ? implode(',', $originalCc) : '(none)'));
        return false;
    }

    // REDIRECT MODE
    if ($mode === 'redirect') {
        $testTo = envCsvArray('MAIL_TEST_TO');
        $testCc = envCsvArray('MAIL_TEST_CC');

        if (empty($testTo)) {
            error_log("Redirect mode enabled but MAIL_TEST_TO empty");
            return false;
        }

        $subject = '[TEST REDIRECT] ' . $subject;

        $message = "
            <div style='border:1px solid orange;padding:10px;margin-bottom:10px'>
                <strong>TEST REDIRECT</strong><br>
                Original To: " . implode(',', $originalTo) . "<br>
                Original CC: " . (!empty($originalCc) ? implode(',', $originalCc) : '(none)') . "
            </div>
        " . $message;

        $originalTo = $testTo;
        $originalCc = $testCc;
    }

    try {
        $mail = new PHPMailer(true);

        // SMTP CONFIG (your requirement)
        $mail->isSMTP();
        $mail->Host = 'mail01.khi.co.jp';
        $mail->SMTPAuth = false;
        $mail->SMTPSecure = false;
        $mail->Port = 25;

        // Sender
        $fromAddress = env('MAIL_FROM_ADDRESS', 'kdt_toraberu@global.kawasaki.com');
        $fromName = env('MAIL_FROM_NAME', 'PCS System');

        $mail->setFrom($fromAddress, $fromName);

        // Recipients
        foreach ($originalTo as $email) {
            if ($email) {
                $mail->addAddress($email);
            }
        }

        foreach ($originalCc as $email) {
            if ($email) {
                $mail->addCC($email);
            }
        }

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;

        $mail->send();

        return true;

    } catch (Exception $e) {
        error_log("EMAIL SEND FAILED: " . $mail->ErrorInfo);
        error_log("To: " . implode(',', $originalTo));
        error_log("CC: " . (!empty($originalCc) ? implode(',', $originalCc) : '(none)'));
        return false;
    }
}