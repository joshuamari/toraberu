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

function buildEmailTestRecipientFooter(array $actualTo, array $prodTo, array $prodCc): string
{
    $escapeList = static function (array $emails): string {
        $emails = array_values(array_filter(array_map('trim', $emails)));
        if (empty($emails)) {
            return '<em>(none)</em>';
        }
        return htmlspecialchars(implode(', ', $emails), ENT_QUOTES, 'UTF-8');
    };

    $actualToText = $escapeList($actualTo);
    $prodToText = $escapeList($prodTo);
    $prodCcText = $escapeList($prodCc);

    return "
        <hr style='margin-top: 28px; border: none; border-top: 1px solid #ccc;'>
        <div style='margin-top: 12px; padding: 12px; background: #fff8e1; border: 1px solid #f0c36d; font-size: 12px; color: #333;'>
            <p style='margin: 0 0 8px 0;'><strong>[TEST MODE]</strong> This email was redirected to developers only. Real recipients were NOT notified.</p>
            <p style='margin: 0 0 4px 0;'><strong>Actually sent To:</strong> {$actualToText}</p>
            <p style='margin: 0 0 4px 0;'><strong>PROD would To:</strong> {$prodToText}</p>
            <p style='margin: 0;'><strong>PROD would CC:</strong> {$prodCcText}</p>
        </div>
    ";
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

    $sendTo = $originalTo;
    $sendCc = $originalCc;

    // REDIRECT MODE — same yellow footer pattern as change-request test emails
    if ($mode === 'redirect') {
        $testTo = envCsvArray('MAIL_TEST_TO');
        $testCc = envCsvArray('MAIL_TEST_CC');

        if (empty($testTo)) {
            error_log("Redirect mode enabled but MAIL_TEST_TO empty");
            return false;
        }

        $subject = '[TEST] ' . $subject;
        $message .= buildEmailTestRecipientFooter($testTo, $originalTo, $originalCc);

        $sendTo = $testTo;
        $sendCc = $testCc;
    }

    try {
        $mail = new PHPMailer(true);

        // SMTP CONFIG (your requirement)
        $mail->isSMTP();
        $mail->Host = 'mail01.khi.co.jp';
        $mail->SMTPAuth = false;
        $mail->SMTPSecure = false;
        $mail->Port = 25;
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        // Sender (address only — no display name, same as PCSKHI)
        $fromAddress = env('MAIL_FROM_ADDRESS', 'kdt_toraberu@global.kawasaki.com');
        $mail->setFrom($fromAddress);

        // Recipients
        foreach ($sendTo as $email) {
            if ($email) {
                $mail->addAddress($email);
            }
        }

        foreach ($sendCc as $email) {
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
        error_log("To: " . implode(',', $sendTo));
        error_log("CC: " . (!empty($sendCc) ? implode(',', $sendCc) : '(none)'));
        return false;
    }
}
