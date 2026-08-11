<?php

/**
 * Outlook-safe HTML for Date Change Request Approved emails.
 *
 * All values in $data should already be escaped for HTML where needed,
 * except numeric day counts / net-change strings which are safe.
 *
 * Expected keys:
 * - requester_surname
 * - employee_name
 * - location_name
 * - group_abbr
 * - dc_ref (e.g. DC-00001)
 * - req_ref (e.g. REQ-00236)
 * - summary_dispatch_dates (original dates for summary row)
 * - original_dates (left schedule card)
 * - updated_dates (right schedule card)
 * - original_days
 * - updated_days
 * - net_change
 * - kdt_cta_url
 * - khi_cta_url
 * - logo_url
 * - test_mode_placeholder
 */
function buildDateChangeRequestApprovedEmailHtml(array $data): string
{
    $requesterSurname = (string)($data['requester_surname'] ?? '');
    $employeeName = (string)($data['employee_name'] ?? '');
    $locationName = (string)($data['location_name'] ?? '');
    $groupAbbr = (string)($data['group_abbr'] ?? '');
    $dcRef = (string)($data['dc_ref'] ?? '');
    $reqRef = (string)($data['req_ref'] ?? '');
    $summaryDispatchDates = (string)($data['summary_dispatch_dates'] ?? '');
    $originalDates = (string)($data['original_dates'] ?? '');
    $updatedDates = (string)($data['updated_dates'] ?? '');
    $originalDays = (string)($data['original_days'] ?? '0');
    $updatedDays = (string)($data['updated_days'] ?? '0');
    $netChange = (string)($data['net_change'] ?? '0');
    $kdtCtaUrl = (string)($data['kdt_cta_url'] ?? '#');
    $khiCtaUrl = (string)($data['khi_cta_url'] ?? '#');
    $logoUrl = (string)($data['logo_url'] ?? '');
    $testModePlaceholder = (string)($data['test_mode_placeholder'] ?? '<!--DISPATCH_EMAIL_TEST_MODE-->');

    $dash = '—';
    $employeeName = $employeeName !== '' ? $employeeName : $dash;
    $locationName = $locationName !== '' ? $locationName : $dash;
    $groupAbbr = $groupAbbr !== '' ? $groupAbbr : $dash;
    $summaryDispatchDates = $summaryDispatchDates !== '' ? $summaryDispatchDates : $dash;
    $originalDates = $originalDates !== '' ? $originalDates : $dash;
    $updatedDates = $updatedDates !== '' ? $updatedDates : $dash;

    $dcBadge = $dcRef !== ''
        ? '<span style="display:inline-block;padding:4px 10px;background-color:#4F39F6;color:#FFFFFF;border-radius:6px;font-size:12px;font-weight:700;line-height:1.3;">'
            . $dcRef
            . '</span>'
        : '<span style="color:#000000;font-size:13px;font-weight:700;">' . $dash . '</span>';

    $reqBadge = $reqRef !== ''
        ? '<span style="display:inline-block;padding:4px 10px;background-color:#4ADE80;color:#000000;border-radius:6px;font-size:12px;font-weight:700;line-height:1.3;">'
            . $reqRef
            . '</span>'
        : '<span style="color:#000000;font-size:13px;font-weight:700;">' . $dash . '</span>';

    return '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Date Change Request Approved</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F9;font-family:Arial, Helvetica, sans-serif;color:#000000;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#F9F9F9;border-collapse:collapse;">
    <tr>
        <td align="center" style="padding:24px 12px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-collapse:collapse;">
                <tr>
                    <td style="padding:28px 34px 24px 34px;border-bottom:1px solid #E9E9E9;">
                        <img src="' . $logoUrl . '" alt="トラべる" width="128" style="display:block;width:128px;max-width:100%;height:auto;border:0;">
                    </td>
                </tr>
                <tr>
                    <td style="padding:30px 34px 26px 34px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                            <tr>
                                <td valign="top" style="font-size:32px;line-height:34px;font-weight:700;color:#000000;padding:0;">
                                    Date Change<br>Request Approved
                                </td>
                                <td align="right" valign="top" style="padding:4px 0 0 12px;white-space:nowrap;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;border:1px solid #2EAD5C;background-color:#F2FFF7;border-radius:8px;">
                                        <tr>
                                            <td style="padding:6px 10px 6px 8px;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                                    <tr>
                                                        <td valign="middle" style="padding-right:6px;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                                                <tr>
                                                                    <td align="center" valign="middle" bgcolor="#4ADE80" style="width:16px;height:16px;background-color:#4ADE80;border-radius:50%;color:#FFFFFF;font-size:11px;line-height:16px;font-weight:700;">&#10003;</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                        <td valign="middle" style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:0.04em;color:#2EAD5C;text-transform:uppercase;">APPROVED</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;margin-top:36px;">
                            <tr>
                                <td style="font-size:13px;line-height:20px;color:#000000;padding:0 0 14px 0;">Dear ' . $requesterSurname . '-san,</td>
                            </tr>
                            <tr>
                                <td style="font-size:13px;line-height:20px;color:#000000;padding:0 0 14px 0;">Your date change request has been reviewed by the KDT President.</td>
                            </tr>
                            <tr>
                                <td style="font-size:13px;line-height:20px;color:#000000;padding:0;">Your date change request has been <strong style="color:#2EAD5C;font-weight:700;">approved.</strong></td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-top:28px;background-color:#F9F9F9;border:1px solid #E9E9E9;border-radius:14px;border-collapse:separate;">
                            <tr>
                                <td colspan="2" style="padding:18px 16px 10px 16px;font-size:14px;line-height:18px;font-weight:700;color:#000000;border-bottom:1px solid #E9E9E9;">Date Change Request Summary</td>
                            </tr>
                            <tr>
                                <td width="50%" valign="top" style="width:50%;padding:14px 14px 14px 16px;border-right:1px solid #E9E9E9;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">NAME</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $employeeName . '</div>
                                </td>
                                <td width="50%" valign="top" style="width:50%;padding:14px 16px 14px 14px;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">LOCATION</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $locationName . '</div>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%" valign="top" style="width:50%;padding:14px 14px 14px 16px;border-right:1px solid #E9E9E9;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">DATE CHANGE REQUEST ID</div>
                                    <div style="line-height:1.45;">' . $dcBadge . '</div>
                                </td>
                                <td width="50%" valign="top" style="width:50%;padding:14px 16px 14px 14px;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">ORIGINAL DISPATCH ID</div>
                                    <div style="line-height:1.45;">' . $reqBadge . '</div>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%" valign="top" style="width:50%;padding:14px 14px 16px 16px;border-right:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">GROUP</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $groupAbbr . '</div>
                                </td>
                                <td width="50%" valign="top" style="width:50%;padding:14px 16px 16px 14px;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">DISPATCH DATES</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $summaryDispatchDates . '</div>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;margin-top:18px;background-color:#F9F9F9;border:1px solid #E9E9E9;border-radius:14px;">
                            <tr>
                                <td style="padding:18px 16px 12px 16px;font-size:14px;line-height:18px;font-weight:700;color:#000000;">Schedule Comparison</td>
                            </tr>
                            <tr>
                                <td style="padding:0 12px 14px 12px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                        <tr>
                                            <td width="44%" valign="middle" style="width:44%;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;background-color:#FFFFFF;border:1px solid #E9E9E9;border-radius:10px;">
                                                    <tr>
                                                        <td style="padding:12px 12px 14px 12px;">
                                                            <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 8px 0;">DISPATCH DATES</div>
                                                            <div style="font-size:12px;line-height:17px;font-weight:700;color:#000000;word-break:break-word;margin:0 0 8px 0;">' . $originalDates . '</div>
                                                            <div style="font-size:12px;line-height:16px;font-weight:700;color:#38B365;">' . $originalDays . ' days</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td width="12%" align="center" valign="middle" style="width:12%;padding:0 4px;font-size:22px;line-height:22px;font-weight:700;color:#2EAD5C;">&rarr;</td>
                                            <td width="44%" valign="middle" style="width:44%;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;background-color:#F2FFF7;border:1px solid #2EAD5C;border-radius:10px;">
                                                    <tr>
                                                        <td style="padding:12px 12px 14px 12px;">
                                                            <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#2EAD5C;margin:0 0 8px 0;">UPDATED DISPATCH DATES</div>
                                                            <div style="font-size:12px;line-height:17px;font-weight:700;color:#000000;word-break:break-word;margin:0 0 8px 0;">' . $updatedDates . '</div>
                                                            <div style="font-size:12px;line-height:16px;font-weight:700;color:#38B365;">' . $updatedDays . ' days</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0 16px 16px 16px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;border-top:1px solid #E9E9E9;">
                                        <tr>
                                            <td style="padding:12px 0 0 0;font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;">NET CHANGE</td>
                                            <td align="right" style="padding:12px 0 0 0;font-size:14px;line-height:16px;font-weight:700;color:#38B365;">' . $netChange . '</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;margin-top:18px;background-color:#F2FFF7;border:1px solid #E9E9E9;border-left:3px solid #2EAD5C;border-radius:10px;">
                            <tr>
                                <td width="36" valign="middle" style="width:36px;padding:14px 0 14px 14px;vertical-align:middle;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td align="center" valign="middle" bgcolor="#4ADE80" style="width:18px;height:18px;background-color:#4ADE80;border-radius:50%;color:#FFFFFF;font-size:11px;line-height:18px;font-weight:700;">&#10003;</td>
                                        </tr>
                                    </table>
                                </td>
                                <td style="padding:14px 16px 14px 8px;font-size:13px;line-height:20px;color:#000000;">
                                    <div style="font-size:13px;line-height:20px;font-weight:700;color:#000000;margin:0 0 12px 0;">Updated dispatch dates are now approved</div>
                                    <div style="font-size:12px;line-height:18px;font-weight:400;color:#000000;">The requested date change was approved. The updated dispatch dates shown above are now the approved schedule for this request.</div>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;border-collapse:collapse;width:100%;">
                            <tr>
                                <td>
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                        <tr>
                                            <td width="50%" valign="top" align="center" style="width:50%;padding-right:6px;">
                                                <div style="margin:0 0 7px 0;font-size:10px;line-height:12px;font-weight:700;letter-spacing:0.04em;color:#959595;">FOR KDT</div>
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                                    <tr>
                                                        <td align="center" bgcolor="#000000" style="background-color:#000000;border-radius:8px;">
                                                            <a href="' . $kdtCtaUrl . '" style="display:block;padding:12px 10px;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:16px;font-weight:700;color:#FFFFFF;text-decoration:none;text-align:center;border-radius:8px;">View Date Change Request&nbsp;&nbsp;&rarr;</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td width="50%" valign="top" align="center" style="width:50%;padding-left:6px;">
                                                <div style="margin:0 0 7px 0;font-size:10px;line-height:12px;font-weight:700;letter-spacing:0.04em;color:#959595;">FOR KHI</div>
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                                    <tr>
                                                        <td align="center" bgcolor="#4ADE80" style="background-color:#4ADE80;border-radius:8px;">
                                                            <a href="' . $khiCtaUrl . '" style="display:block;padding:12px 10px;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:16px;font-weight:700;color:#000000;text-decoration:none;text-align:center;border-radius:8px;">View Request Status&nbsp;&nbsp;&rarr;</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;border-collapse:collapse;width:100%;">
                            <tr>
                                <td style="padding:0;">
                                    ' . $testModePlaceholder . '
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:0;background-color:#E8E8E8;border-radius:9px;border-collapse:separate;width:100%;">
                            <tr>
                                <td width="42" valign="middle" style="width:42px;padding:13px 0 13px 15px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td align="center" valign="middle" style="width:18px;height:18px;border:1px solid #959595;border-radius:50%;color:#878787;font-size:11px;line-height:18px;font-weight:700;">i</td>
                                        </tr>
                                    </table>
                                </td>
                                <td style="padding:12px 15px 12px 4px;font-size:11px;line-height:16px;color:#7D7D7D;">
                                    This is a system-generated email. Please do not reply to this message.<br>
                                    If you need assistance, contact your トラべる administrator.
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;border-collapse:collapse;width:100%;">
                            <tr>
                                <td>
                                    <img src="' . $logoUrl . '" alt="トラべる" width="84" style="display:block;width:84px;max-width:100%;height:auto;border:0;">
                                    <div style="margin-top:9px;font-size:11px;line-height:14px;color:#7D7D7D;">KDT Design &amp; Technical Service, Inc.</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>';
}

/**
 * Outlook-safe HTML for Date Change Request Declined emails.
 * Same family layout as buildDateChangeRequestApprovedEmailHtml(); decline styling differs.
 *
 * Expected keys:
 * - requester_surname, employee_name, location_name, group_abbr
 * - dc_ref, req_ref
 * - summary_dispatch_dates
 * - current_dates, proposed_dates
 * - current_days, proposed_days
 * - remaining_dates (for callout — currently approved range)
 * - kdt_cta_url, khi_cta_url, logo_url
 * - test_mode_placeholder
 */
function buildDateChangeRequestDeclinedEmailHtml(array $data): string
{
    $requesterSurname = (string)($data['requester_surname'] ?? '');
    $employeeName = (string)($data['employee_name'] ?? '');
    $locationName = (string)($data['location_name'] ?? '');
    $groupAbbr = (string)($data['group_abbr'] ?? '');
    $dcRef = (string)($data['dc_ref'] ?? '');
    $reqRef = (string)($data['req_ref'] ?? '');
    $summaryDispatchDates = (string)($data['summary_dispatch_dates'] ?? '');
    $currentDates = (string)($data['current_dates'] ?? '');
    $proposedDates = (string)($data['proposed_dates'] ?? '');
    $currentDays = (string)($data['current_days'] ?? '0');
    $proposedDays = (string)($data['proposed_days'] ?? '0');
    $remainingDates = (string)($data['remaining_dates'] ?? '');
    $kdtCtaUrl = (string)($data['kdt_cta_url'] ?? '#');
    $khiCtaUrl = (string)($data['khi_cta_url'] ?? '#');
    $logoUrl = (string)($data['logo_url'] ?? '');
    $testModePlaceholder = (string)($data['test_mode_placeholder'] ?? '<!--DISPATCH_EMAIL_TEST_MODE-->');

    $dash = '—';
    $employeeName = $employeeName !== '' ? $employeeName : $dash;
    $locationName = $locationName !== '' ? $locationName : $dash;
    $groupAbbr = $groupAbbr !== '' ? $groupAbbr : $dash;
    $summaryDispatchDates = $summaryDispatchDates !== '' ? $summaryDispatchDates : $dash;
    $currentDates = $currentDates !== '' ? $currentDates : $dash;
    $proposedDates = $proposedDates !== '' ? $proposedDates : $dash;
    $remainingDates = $remainingDates !== '' ? $remainingDates : $dash;

    $dcBadge = $dcRef !== ''
        ? '<span style="display:inline-block;padding:4px 10px;background-color:#4F39F6;color:#FFFFFF;border-radius:6px;font-size:12px;font-weight:700;line-height:1.3;">'
            . $dcRef
            . '</span>'
        : '<span style="color:#000000;font-size:13px;font-weight:700;">' . $dash . '</span>';

    $reqBadge = $reqRef !== ''
        ? '<span style="display:inline-block;padding:4px 10px;background-color:#4ADE80;color:#000000;border-radius:6px;font-size:12px;font-weight:700;line-height:1.3;">'
            . $reqRef
            . '</span>'
        : '<span style="color:#000000;font-size:13px;font-weight:700;">' . $dash . '</span>';

    return '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Date Change Request Declined</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F9;font-family:Arial, Helvetica, sans-serif;color:#000000;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#F9F9F9;border-collapse:collapse;">
    <tr>
        <td align="center" style="padding:24px 12px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-collapse:collapse;">
                <tr>
                    <td style="padding:28px 34px 24px 34px;border-bottom:1px solid #E9E9E9;">
                        <img src="' . $logoUrl . '" alt="トラべる" width="128" style="display:block;width:128px;max-width:100%;height:auto;border:0;">
                    </td>
                </tr>
                <tr>
                    <td style="padding:30px 34px 26px 34px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                            <tr>
                                <td valign="top" style="font-size:32px;line-height:34px;font-weight:700;color:#000000;padding:0;">
                                    Date Change<br>Request Declined
                                </td>
                                <td align="right" valign="top" style="padding:4px 0 0 12px;white-space:nowrap;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;border:1px solid #AD2E52;background-color:#FFF2F6;border-radius:8px;">
                                        <tr>
                                            <td style="padding:6px 10px 6px 8px;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                                    <tr>
                                                        <td valign="middle" style="padding-right:6px;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                                                <tr>
                                                                    <td align="center" valign="middle" bgcolor="#DE4A7B" style="width:16px;height:16px;background-color:#DE4A7B;border-radius:50%;color:#FFFFFF;font-size:11px;line-height:16px;font-weight:700;">&times;</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                        <td valign="middle" style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:0.04em;color:#AD2E52;text-transform:uppercase;">DECLINED</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;margin-top:36px;">
                            <tr>
                                <td style="font-size:13px;line-height:20px;color:#000000;padding:0 0 14px 0;">Dear ' . $requesterSurname . '-san,</td>
                            </tr>
                            <tr>
                                <td style="font-size:13px;line-height:20px;color:#000000;padding:0 0 14px 0;">Your date change request has been reviewed by the KDT President.</td>
                            </tr>
                            <tr>
                                <td style="font-size:13px;line-height:20px;color:#000000;padding:0;">The request has been <strong style="color:#DE4A7B;font-weight:700;">declined.</strong></td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-top:28px;background-color:#F9F9F9;border:1px solid #E9E9E9;border-radius:14px;border-collapse:separate;">
                            <tr>
                                <td colspan="2" style="padding:18px 16px 10px 16px;font-size:14px;line-height:18px;font-weight:700;color:#000000;border-bottom:1px solid #E9E9E9;">Date Change Request Summary</td>
                            </tr>
                            <tr>
                                <td width="50%" valign="top" style="width:50%;padding:14px 14px 14px 16px;border-right:1px solid #E9E9E9;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">NAME</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $employeeName . '</div>
                                </td>
                                <td width="50%" valign="top" style="width:50%;padding:14px 16px 14px 14px;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">LOCATION</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $locationName . '</div>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%" valign="top" style="width:50%;padding:14px 14px 14px 16px;border-right:1px solid #E9E9E9;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">DATE CHANGE REQUEST ID</div>
                                    <div style="line-height:1.45;">' . $dcBadge . '</div>
                                </td>
                                <td width="50%" valign="top" style="width:50%;padding:14px 16px 14px 14px;border-bottom:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">ORIGINAL DISPATCH ID</div>
                                    <div style="line-height:1.45;">' . $reqBadge . '</div>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%" valign="top" style="width:50%;padding:14px 14px 16px 16px;border-right:1px solid #E9E9E9;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">GROUP</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $groupAbbr . '</div>
                                </td>
                                <td width="50%" valign="top" style="width:50%;padding:14px 16px 16px 14px;">
                                    <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 6px 0;">DISPATCH DATES</div>
                                    <div style="font-size:13px;line-height:18px;font-weight:700;color:#000000;word-break:break-word;">' . $summaryDispatchDates . '</div>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;margin-top:18px;background-color:#F9F9F9;border:1px solid #E9E9E9;border-radius:14px;">
                            <tr>
                                <td style="padding:18px 16px 12px 16px;font-size:14px;line-height:18px;font-weight:700;color:#000000;">Schedule Comparison</td>
                            </tr>
                            <tr>
                                <td style="padding:0 12px 16px 12px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                        <tr>
                                            <td width="44%" valign="middle" style="width:44%;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;background-color:#FFFFFF;border:1px solid #E9E9E9;border-radius:10px;">
                                                    <tr>
                                                        <td style="padding:12px 12px 14px 12px;">
                                                            <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#959595;margin:0 0 8px 0;">CURRENT DISPATCH DATES</div>
                                                            <div style="font-size:12px;line-height:17px;font-weight:700;color:#000000;word-break:break-word;margin:0 0 8px 0;">' . $currentDates . '</div>
                                                            <div style="font-size:12px;line-height:16px;font-weight:700;color:#2EAD5C;">' . $currentDays . ' days</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td width="12%" align="center" valign="middle" style="width:12%;padding:0 4px;font-size:28px;line-height:28px;font-weight:700;color:#DE4A7B;">&times;</td>
                                            <td width="44%" valign="middle" style="width:44%;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;background-color:#FFF2F7;border:1px solid #F7C8D8;border-radius:10px;">
                                                    <tr>
                                                        <td style="padding:12px 12px 14px 12px;">
                                                            <div style="font-size:10px;line-height:12px;letter-spacing:0.04em;text-transform:uppercase;color:#DE4C7D;margin:0 0 8px 0;">PROPOSED DATES (NOT APPLIED)</div>
                                                            <div style="font-size:12px;line-height:17px;font-weight:700;color:#000000;word-break:break-word;margin:0 0 8px 0;">' . $proposedDates . '</div>
                                                            <div style="font-size:12px;line-height:16px;font-weight:700;color:#000000;">' . $proposedDays . ' days</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;width:100%;margin-top:18px;background-color:#FFF2F7;border:1px solid #F7C8D8;border-left:3px solid #DE4A7B;border-radius:10px;">
                            <tr>
                                <td width="36" valign="middle" style="width:36px;padding:14px 0 14px 14px;vertical-align:middle;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td align="center" valign="middle" bgcolor="#DE4A7B" style="width:18px;height:18px;background-color:#DE4A7B;border-radius:50%;color:#FFFFFF;font-size:11px;line-height:18px;font-weight:700;">&times;</td>
                                        </tr>
                                    </table>
                                </td>
                                <td style="padding:14px 16px 14px 8px;font-size:13px;line-height:20px;color:#000000;">
                                    <div style="font-size:13px;line-height:20px;font-weight:700;color:#000000;margin:0 0 12px 0;">The proposed date change was declined.</div>
                                    <div style="font-size:12px;line-height:18px;font-weight:400;color:#000000;">The approved dispatch dates remain ' . $remainingDates . '</div>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;border-collapse:collapse;width:100%;">
                            <tr>
                                <td>
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                        <tr>
                                            <td width="50%" valign="top" align="center" style="width:50%;padding-right:6px;">
                                                <div style="margin:0 0 7px 0;font-size:10px;line-height:12px;font-weight:700;letter-spacing:0.04em;color:#959595;">FOR KDT</div>
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                                    <tr>
                                                        <td align="center" bgcolor="#000000" style="background-color:#000000;border-radius:8px;">
                                                            <a href="' . $kdtCtaUrl . '" style="display:block;padding:12px 10px;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:16px;font-weight:700;color:#FFFFFF;text-decoration:none;text-align:center;border-radius:8px;">View Date Change Request&nbsp;&nbsp;&rarr;</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td width="50%" valign="top" align="center" style="width:50%;padding-left:6px;">
                                                <div style="margin:0 0 7px 0;font-size:10px;line-height:12px;font-weight:700;letter-spacing:0.04em;color:#959595;">FOR KHI</div>
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                                                    <tr>
                                                        <td align="center" bgcolor="#4ADE80" style="background-color:#4ADE80;border-radius:8px;">
                                                            <a href="' . $khiCtaUrl . '" style="display:block;padding:12px 10px;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:16px;font-weight:700;color:#000000;text-decoration:none;text-align:center;border-radius:8px;">View Request Status&nbsp;&nbsp;&rarr;</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;border-collapse:collapse;width:100%;">
                            <tr>
                                <td style="padding:0;">
                                    ' . $testModePlaceholder . '
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:0;background-color:#E8E8E8;border-radius:9px;border-collapse:separate;width:100%;">
                            <tr>
                                <td width="42" valign="middle" style="width:42px;padding:13px 0 13px 15px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td align="center" valign="middle" style="width:18px;height:18px;border:1px solid #959595;border-radius:50%;color:#878787;font-size:11px;line-height:18px;font-weight:700;">i</td>
                                        </tr>
                                    </table>
                                </td>
                                <td style="padding:12px 15px 12px 4px;font-size:11px;line-height:16px;color:#7D7D7D;">
                                    This is a system-generated email. Please do not reply to this message.<br>
                                    If you need assistance, contact your トラべる administrator.
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;border-collapse:collapse;width:100%;">
                            <tr>
                                <td>
                                    <img src="' . $logoUrl . '" alt="トラべる" width="84" style="display:block;width:84px;max-width:100%;height:auto;border:0;">
                                    <div style="margin-top:9px;font-size:11px;line-height:14px;color:#7D7D7D;">KDT Design &amp; Technical Service, Inc.</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>';
}
