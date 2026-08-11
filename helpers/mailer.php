<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

function getEmailMode(): string
{
    return strtolower(trim((string)env('EMAIL_MODE', 'off')));
}

/**
 * Public base URL for links/images in outbound emails.
 * Never use the request host (localhost) — mail clients cannot reach it.
 */
function getEmailPublicBaseUrl(): string
{
    $configured = rtrim(trim((string)env('APP_URL', '')), '/');
    if ($configured !== '') {
        return $configured;
    }

    return 'http://kdt-ph.kdts.net';
}

/** CID used for the embedded トラべる logo in HTML emails. */
function getEmailLogoCid(): string
{
    return 'toraberu-logo';
}

function getEmailLogoPath(): string
{
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'pcs logo bold.png';
}

/**
 * Logo src for HTML templates. Prefer CID so images render without
 * depending on a reachable public URL or corporate SSL trust.
 */
function getEmailLogoUrl(): string
{
    return 'cid:' . getEmailLogoCid();
}

/** Remote fallback when CID embedding is unavailable (legacy mail()). */
function getEmailLogoRemoteUrl(): string
{
    return getEmailPublicBaseUrl() . '/PCS/images/' . rawurlencode('pcs logo bold.png');
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
        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='margin: 0 0 28px 0; border-collapse: collapse;'>
            <tr>
                <td style='padding: 14px 16px; background-color: #F9F9F9; border: 1px solid #E9E9E9; border-radius: 10px; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 15px; color: #7D7D7D; word-break: break-word;'>
                    <p style='margin: 0 0 8px 0; color: #000000;'><strong>[TEST MODE]</strong> This email was redirected to developers only. Real recipients were NOT notified.</p>
                    <p style='margin: 0 0 4px 0;'><strong style='color: #000000;'>Actually sent To:</strong> {$actualToText}</p>
                    <p style='margin: 0 0 4px 0;'><strong style='color: #000000;'>PROD would To:</strong> {$prodToText}</p>
                    <p style='margin: 0;'><strong style='color: #000000;'>PROD would CC:</strong> {$prodCcText}</p>
                </td>
            </tr>
        </table>
    ";
}

/**
 * Low-level HTML send via PHPMailer. Embeds the トラべる logo when the body uses cid:toraberu-logo.
 *
 * @param string[] $to
 * @param string[] $cc
 * @param string[] $bcc
 */
function sendPhpMailerHtmlEmail(
    array $to,
    string $subject,
    string $message,
    array $cc = [],
    array $bcc = [],
    ?string $fromAddress = null
): bool {
    $to = array_values(array_filter(array_map('trim', $to)));
    $cc = array_values(array_filter(array_map('trim', $cc)));
    $bcc = array_values(array_filter(array_map('trim', $bcc)));

    if (empty($to)) {
        return false;
    }

    try {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host = 'mail01.khi.co.jp';
        $mail->SMTPAuth = false;
        $mail->SMTPSecure = false;
        $mail->Port = 25;
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $from = trim((string)($fromAddress ?: env('MAIL_FROM_ADDRESS', 'kdt_toraberu@global.kawasaki.com')));
        if ($from === '') {
            $from = 'kdt_toraberu@global.kawasaki.com';
        }
        $mail->setFrom($from);

        foreach ($to as $email) {
            $mail->addAddress($email);
        }
        foreach ($cc as $email) {
            $mail->addCC($email);
        }
        foreach ($bcc as $email) {
            $mail->addBCC($email);
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;

        $logoCid = getEmailLogoCid();
        $logoPath = getEmailLogoPath();
        if (is_file($logoPath) && strpos($message, 'cid:' . $logoCid) !== false) {
            $mail->addEmbeddedImage(
                $logoPath,
                $logoCid,
                'pcs-logo-bold.png',
                PHPMailer::ENCODING_BASE64,
                'image/png'
            );
        }

        $mail->send();
        return true;
    } catch (Exception $e) {
        $errorInfo = isset($mail) ? $mail->ErrorInfo : $e->getMessage();
        error_log('EMAIL SEND FAILED: ' . $errorInfo);
        error_log('To: ' . implode(',', $to));
        error_log('CC: ' . (!empty($cc) ? implode(',', $cc) : '(none)'));
        error_log('BCC: ' . (!empty($bcc) ? implode(',', $bcc) : '(none)'));
        return false;
    }
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
        $testFooter = buildEmailTestRecipientFooter($testTo, $originalTo, $originalCc);
        if (strpos($message, '<!--EMAIL_TEST_MODE-->') !== false) {
            $message = str_replace('<!--EMAIL_TEST_MODE-->', $testFooter, $message);
        } else {
            $message .= $testFooter;
        }

        $sendTo = $testTo;
        $sendCc = $testCc;
    } else {
        $message = str_replace('<!--EMAIL_TEST_MODE-->', '', $message);
    }

    return sendPhpMailerHtmlEmail($sendTo, $subject, $message, $sendCc);
}
