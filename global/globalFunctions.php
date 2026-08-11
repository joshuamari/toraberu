<?php
#region Functions
function checkOverlap($empnum, $range)
{
    global $connpcs;
    $isOverlap = false;
    $starttime = $range['start'];
    $endtime = $range['end'];
    $dispatchQ = "SELECT * FROM `dispatch_list` WHERE `emp_number` = :empnum AND((`dispatch_from` BETWEEN :starttime AND :endtime OR `dispatch_to` BETWEEN :starttime AND :endtime) OR(:starttime BETWEEN `dispatch_from` AND `dispatch_to` OR :endtime BETWEEN `dispatch_from` AND `dispatch_to`))";
    $dispatchStmt = $connpcs->prepare($dispatchQ);
    $dispatchStmt->execute([":empnum" => $empnum, ":starttime" => $starttime, ":endtime" => $endtime]);
    if ($dispatchStmt->rowCount() > 0) {
        $isOverlap = true;
    }

    return $isOverlap;
}

function checkAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 36;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}

function checkEditAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 37;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}

function alLGroupAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 42;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}

function getMembers($empnum)
{
    global $connnew;
    $members = array();
    $yearMonth = date("Y-m-01");
    $myGroups = getGroups($empnum);
    foreach ($myGroups as $grp) {
        $memsQ = "SELECT `id` FROM `employee_list` WHERE `group_id` = :grp AND (`resignation_date` IS NULL OR `resignation_date` = '0000-00-00' OR `resignation_date` > :yearMonth) 
        AND `nickname` <> ''";
        $memsStmt = $connnew->prepare($memsQ);
        $memsStmt->execute([":grp" => $grp, ":yearMonth" => $yearMonth]);
        if ($memsStmt->rowCount() > 0) {
            $memArr = $memsStmt->fetchAll();
            $arrValues = array_column($memArr, "id");
            $members = array_merge($members, $arrValues);
        }
    }
    return $members;
}

function getGroups($empnum)
{
    global $connnew;
    $allGroupAccess = alLGroupAccess($empnum);
    $myGroups = array();
    if (!$allGroupAccess) {
        $groupsQ = "SELECT `group_id` FROM `employee_group` WHERE `employee_number` = :empnum";
        $groupsStmt = $connnew->prepare($groupsQ);
        $groupsStmt->execute([":empnum" => $empnum]);
        if ($groupsStmt->rowCount() > 0) {
            $groupArr = $groupsStmt->fetchAll();
            foreach ($groupArr as $grp) {
                $group = $grp['group_id'];
                array_push($myGroups, $group);
            }
        }
    } else {
        $groupsQ = "SELECT `id` FROM `group_list`";
        $groupsStmt = $connnew->prepare($groupsQ);
        $groupsStmt->execute();
        if ($groupsStmt->rowCount() > 0) {
            $groupArr = $groupsStmt->fetchAll();
            foreach ($groupArr as $grp) {
                $group = $grp['id'];
                array_push($myGroups, $group);
            }
        }
    }
    return $myGroups;
}

function getID()
{
    global $connpcs;
    $empID = 0;

    if (!empty($_COOKIE["userID"])) {
        $userHash = $_COOKIE["userID"];
    }
    $empidQ = "SELECT fldEmployeeNum as empID FROM kdtphdb.kdtlogin WHERE fldUserHash = :userHash";
    $empidStmt = $connpcs->prepare($empidQ);
    $empidStmt->execute([":userHash" => "$userHash"]);
    if ($empidStmt->rowCount() > 0) {
        $empID = $empidStmt->fetchColumn();
    }
    return $empID;
}
function getName($id)
{
    global $connnew;
    global $connpcs;
    $name = '';
    $newQ = "SELECT CONCAT(`surname`,', ',`firstname`) FROM `employee_list` WHERE `id`=:id";
    $newStmt = $connnew->prepare($newQ);
    $newStmt->execute([":id" => $id]);
    if ($newStmt->rowCount() > 0) {
        $name = $newStmt->fetchColumn();
    } else {
        $pcsQ = "SELECT CONCAT(`surname`,', ',`firstname`) FROM `khi_details` WHERE `number`=:id";
        $pcsStmt = $connpcs->prepare($pcsQ);
        $pcsStmt->execute([":id" => $id]);
        if ($pcsStmt->rowCount() > 0) {
            $name = $pcsStmt->fetchColumn();
        }
    }

    return ucwords(strtolower($name));
}
function getPresID()
{
    global $connnew;
    $arrayID = [];
    $idp = 0;
    $idQ = "SELECT `id` FROM `employee_list` WHERE `designation`=29 AND `resignation_date` < CURRENT_DATE()";
    $idStmt = $connnew->query($idQ);
    if ($idStmt->rowCount() > 0) {
        $idp = $idStmt->fetchColumn();
        $arrayID[] = (int)$idp;
    }
    return $arrayID;
}
function getPresEmail()
{
    global $connnew;
    $emailp = '';
    $emailQ = "SELECT `email` FROM `employee_list` WHERE `designation`=29 AND `resignation_date` < CURRENT_DATE()";
    $emailStmt = $connnew->query($emailQ);
    if ($emailStmt->rowCount() > 0) {
        $emailp = $emailStmt->fetchColumn();
    }
    return $emailp;
}
function getAdminEmails()
{
    global $connnew;
    $adminEmail = array();
    $exclude = [29, 40, 43, 44, 45, 49, 51, 53];
    $adminGroupID = 2;
    $excludeStmt = "AND `designation` NOT IN (" . implode(",", $exclude) . ")";
    $emailQ = "SELECT `email` FROM `employee_list` WHERE `group_id`=:group_id $excludeStmt";
    $emailStmt = $connnew->prepare($emailQ);
    $emailStmt->execute([":group_id" => $adminGroupID]);
    if ($emailStmt->rowCount() > 0) {
        $emailArr = $emailStmt->fetchAll();
        foreach ($emailArr as $emails) {
            $adminEmail[] = $emails['email'];
        }
    }
    return $adminEmail;
}
function groupByID($id)
{
    global $connnew;
    $grpID = 0;
    $grpQ = "SELECT `group_id` FROM `employee_list` WHERE `id`=:id";
    $grpStmt = $connnew->prepare($grpQ);
    $grpStmt->execute([":id" => $id]);
    if ($grpStmt->rowCount() > 0) {
        $grpID = $grpStmt->fetchColumn();
    }
    return $grpID;
}
function getKHIPICEmail($group_id, $exclude = 0)
{
    global $connpcs;
    $khiEmail = array();
    $khiQ = "SELECT `email` FROM `khi_details` WHERE `group_id`=:group_id AND `number` != :exclude";
    $khiStmt = $connpcs->prepare($khiQ);
    $khiStmt->execute([":group_id" => $group_id, ":exclude" => $exclude]);
    if ($khiStmt->rowCount() > 0) {
        $khiArr = $khiStmt->fetchAll();
        foreach ($khiArr as $emails) {
            $khiEmail[] = $emails['email'];
        }
    }
    return $khiEmail;
}
function getKHIAdminEmails()
{
    global $connpcs;
    $khiEmail = array();
    $khiQ = "SELECT `email` FROM `khi_details` WHERE `group_id`=2 AND `number` != 905007";
    $khiStmt = $connpcs->prepare($khiQ);
    $khiStmt->execute();
    if ($khiStmt->rowCount() > 0) {
        $khiArr = $khiStmt->fetchAll();
        foreach ($khiArr as $emails) {
            $khiEmail[] = $emails['email'];
        }
    }
    return $khiEmail;
}
function getRequestDetails($request_id)
{
    global $connpcs;
    $details = array();
    $detailsQ = "SELECT * FROM `request_list` WHERE `request_id`=:request_id";
    $detailsStmt = $connpcs->prepare($detailsQ);
    $detailsStmt->execute([":request_id" => $request_id]);
    $details = $detailsStmt->fetch();
    $details['emp_group'] = groupByID($details['emp_number']);
    return $details;
}
function getKHIUserDetails($id)
{
    global $connpcs;
    $khidetails = array();
    $khidQ = "SELECT `surname`,`email` FROM `khi_details` WHERE `number`=:id";
    $khidStmt = $connpcs->prepare($khidQ);
    $khidStmt->execute([":id" => $id]);
    $khidetails = $khidStmt->fetch();
    return $khidetails;
}
function getLocationName($id)
{
    global $connpcs;
    $name = '';
    $nameQ = "SELECT `location_name` FROM `location_list` WHERE `location_id`=:id";
    $nameStmt = $connpcs->prepare($nameQ);
    $nameStmt->execute([":id" => $id]);
    $name = $nameStmt->fetchColumn();
    return $name;
}
/**
 * Keep in sync with PCSKHI DISPATCH_EMAIL_TEST_MODE while testing.
 * Set to false before production go-live.
 */
define('DISPATCH_EMAIL_TEST_MODE', true);

/**
 * Developer employee IDs.
 * - TEST mode: emails are redirected To these developers only
 * - PROD mode: these developers are BCC'd so delivery can be verified
 */
define('DISPATCH_EMAIL_DEV_IDS', [464, 487, 510]);

function getDispatchEmailDevEmails(): array
{
    global $connnew;
    $ids = DISPATCH_EMAIL_DEV_IDS;
    if (empty($ids)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $connnew->prepare(
        "SELECT `email` FROM `employee_list` WHERE `id` IN ($placeholders)"
    );
    $stmt->execute(array_values($ids));
    $emails = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'email');

    return array_values(array_unique(array_filter(array_map('trim', $emails))));
}

/**
 * Build To / CC / BCC for status-change emails (dispatch approve/deny + change-request approve/deny).
 * To: KHI requester; CC: KHI PIC, KHI admins, KDT managers, system admins, president.
 *
 * @return array{to: string[], cc: string[], bcc: string[], prod_to: string[], prod_cc: string[], test_mode: bool, khidetails: array, link: string}
 */
function buildStatusChangeEmailRecipients(array $details): array
{
    // Use http for email assets — https://kdt-ph.kdts.net uses a private corporate CA
    // that many mail clients will not trust, which breaks remote images.
    $link = function_exists('getEmailPublicBaseUrl')
        ? getEmailPublicBaseUrl()
        : 'http://kdt-ph.kdts.net';
    $khidetails = getKHIUserDetails($details['requester_id']);
    if (!is_array($khidetails)) {
        $khidetails = [];
    }
    $group = ((int)($details['dept_id'] ?? 0) === 15)
        ? 21
        : (int)($details['emp_group'] ?? 0);
    $devEmails = getDispatchEmailDevEmails();

    #region PROD recipient resolution (always computed)
    $admins = getAdminEmails();
    $khipic = getKHIPICEmail($group, $details['requester_id'] ?? 0);
    $khiAdmins = getKHIAdminEmails();
    $kdtManagers = getGroupManagersEmail($group);
    $prodCc = array_values(array_unique(array_filter(array_merge(
        $khipic,
        $khiAdmins,
        $kdtManagers,
        $admins
    ))));
    $presEmail = getPresEmail();
    if ($presEmail !== '') {
        $prodCc[] = $presEmail;
        $prodCc = array_values(array_unique(array_filter($prodCc)));
    }
    $prodCc = array_reverse($prodCc);
    $prodTo = [];
    $requesterEmail = trim((string)($khidetails['email'] ?? ''));
    if ($requesterEmail !== '') {
        $prodTo[] = $requesterEmail;
    }
    #endregion

    $to = $prodTo;
    $cc = $prodCc;
    $bcc = [];
    $testMode = defined('DISPATCH_EMAIL_TEST_MODE') && DISPATCH_EMAIL_TEST_MODE;

    if ($testMode) {
        $to = $devEmails;
        $cc = [];
        $bcc = [];
    } else {
        $visible = array_map('strtolower', array_merge($to, $cc));
        $bcc = array_values(array_filter(
            $devEmails,
            static fn($email) => !in_array(strtolower((string)$email), $visible, true)
        ));
    }

    return [
        "to" => array_values(array_filter($to)),
        "cc" => array_values(array_filter($cc)),
        "bcc" => array_values(array_filter($bcc)),
        "prod_to" => $prodTo,
        "prod_cc" => $prodCc,
        "test_mode" => $testMode,
        "khidetails" => $khidetails,
        "link" => $link,
    ];
}

function buildDispatchEmailTestRecipientFooter(array $recipients): string
{
    if (empty($recipients['test_mode'])) {
        return '';
    }

    $escapeList = static function (array $emails): string {
        if (empty($emails)) {
            return '<em>(none)</em>';
        }
        return htmlspecialchars(implode(', ', $emails), ENT_QUOTES, 'UTF-8');
    };

    $actualTo = $escapeList($recipients['to'] ?? []);
    $prodTo = $escapeList($recipients['prod_to'] ?? []);
    $prodCc = $escapeList($recipients['prod_cc'] ?? []);

    return "
        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='margin: 0 0 28px 0; border-collapse: collapse;'>
            <tr>
                <td style='padding: 14px 16px; background-color: #F9F9F9; border: 1px solid #E9E9E9; border-radius: 10px; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 15px; color: #7D7D7D; word-break: break-word;'>
                    <p style='margin: 0 0 8px 0; color: #000000;'><strong>[TEST MODE]</strong> This email was redirected to developers only. Real recipients were NOT notified.</p>
                    <p style='margin: 0 0 4px 0;'><strong style='color: #000000;'>Actually sent To:</strong> {$actualTo}</p>
                    <p style='margin: 0 0 4px 0;'><strong style='color: #000000;'>PROD would To:</strong> {$prodTo}</p>
                    <p style='margin: 0;'><strong style='color: #000000;'>PROD would CC:</strong> {$prodCc}</p>
                </td>
            </tr>
        </table>
    ";
}

function ensureDispatchMailerLoaded(): bool
{
    static $loaded = null;
    if ($loaded !== null) {
        return $loaded;
    }

    $root = dirname(__DIR__);
    $autoload = $root . '/vendor/autoload.php';
    $envHelper = $root . '/helpers/env.php';
    $mailer = $root . '/helpers/mailer.php';

    if (!is_file($autoload) || !is_file($envHelper) || !is_file($mailer)) {
        return $loaded = false;
    }

    require_once $autoload;
    require_once $envHelper;

    if (class_exists(\Dotenv\Dotenv::class)) {
        \Dotenv\Dotenv::createImmutable($root)->safeLoad();
    }

    require_once $mailer;
    return $loaded = true;
}

function getDispatchEmailLogoUrl(): string
{
    ensureDispatchMailerLoaded();
    if (function_exists('getEmailLogoUrl')) {
        return getEmailLogoUrl();
    }
    return 'cid:toraberu-logo';
}

function sendDispatchNotificationEmail(string $subject, string $msg, array $recipients): bool
{
    $to = array_values(array_filter(array_map('trim', $recipients['to'] ?? [])));
    if (empty($to)) {
        return false;
    }

    if (!empty($recipients['test_mode'])) {
        $subject = '[TEST] ' . $subject;
        $testFooter = buildDispatchEmailTestRecipientFooter($recipients);
        if (strpos($msg, '<!--DISPATCH_EMAIL_TEST_MODE-->') !== false) {
            $msg = str_replace('<!--DISPATCH_EMAIL_TEST_MODE-->', $testFooter, $msg);
        } else {
            $msg .= $testFooter;
        }
    } else {
        $msg = str_replace('<!--DISPATCH_EMAIL_TEST_MODE-->', '', $msg);
    }

    $cc = array_values(array_filter(array_map('trim', $recipients['cc'] ?? [])));
    $bcc = array_values(array_filter(array_map('trim', $recipients['bcc'] ?? [])));

    // Prefer PHPMailer so the logo can be embedded as CID (remote localhost/https URLs break in clients).
    if (ensureDispatchMailerLoaded() && function_exists('sendPhpMailerHtmlEmail')) {
        return sendPhpMailerHtmlEmail(
            $to,
            $subject,
            $msg,
            $cc,
            $bcc,
            'kdt_toraberu@global.kawasaki.com'
        );
    }

    // Legacy fallback: rewrite CID to a public HTTP URL, then use PHP mail().
    $remoteLogo = 'http://kdt-ph.kdts.net/PCS/images/' . rawurlencode('pcs logo bold.png');
    $msg = str_replace(['cid:toraberu-logo', 'cid:' . (function_exists('getEmailLogoCid') ? getEmailLogoCid() : 'toraberu-logo')], $remoteLogo, $msg);

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: kdt_toraberu@global.kawasaki.com" . "\r\n";
    if (!empty($cc)) {
        $headers .= "CC: " . implode(',', $cc) . "\r\n";
    }
    if (!empty($bcc)) {
        $headers .= "Bcc: " . implode(',', $bcc) . "\r\n";
    }

    return mail(implode(',', $to), $subject, $msg, $headers);
}

function getGroupAbbreviation($groupId)
{
    global $connnew;
    $groupId = (int)$groupId;
    if ($groupId <= 0) {
        return '';
    }
    $grpQ = "SELECT `abbreviation` FROM `group_list` WHERE `id` = :id LIMIT 1";
    $grpStmt = $connnew->prepare($grpQ);
    $grpStmt->execute([":id" => $groupId]);
    $abbr = $grpStmt->fetchColumn();
    return $abbr !== false ? (string)$abbr : '';
}

function emailStatusChange($status, $details)
{
    $recipients = buildStatusChangeEmailRecipients($details);
    $khidetails = $recipients['khidetails'];
    $link = $recipients['link'];
    $isApproved = (bool)$status;
    $subject = $isApproved ? 'Dispatch Request Approved' : 'Dispatch Request Declined';

    require_once __DIR__ . '/../helpers/dispatch_email_templates.php';

    $escape = static function ($value): string {
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
    };
    $formatEmailDate = static function ($date) use ($escape): string {
        $raw = trim((string)$date);
        if ($raw === '') {
            return '';
        }
        $ts = strtotime($raw);
        if ($ts === false) {
            return $escape($raw);
        }
        return $escape(date('d M Y', $ts));
    };

    $requestId = (int)($details['request_id'] ?? 0);
    $requestRef = $requestId > 0
        ? 'REQ-' . str_pad((string)$requestId, 5, '0', STR_PAD_LEFT)
        : '';

    $dispatchFrom = $formatEmailDate($details['dispatch_from'] ?? '');
    $dispatchTo = $formatEmailDate($details['dispatch_to'] ?? '');
    $dispatchDates = trim(
        $dispatchFrom
        . ($dispatchFrom !== '' && $dispatchTo !== '' ? ' — ' : '')
        . $dispatchTo
    );

    $kdtCtaUrl = $requestId > 0
        ? $link . '/PCS/requestList/?open_request=' . rawurlencode((string)$requestId)
        : $link . '/PCS/requestList/';
    $khiCtaUrl = $requestId > 0
        ? $link . '/PCSKHI/requestList/?request_id=' . rawurlencode((string)$requestId)
        : $link . '/PCSKHI/requestList/';
    $logoUrl = getDispatchEmailLogoUrl();

    $templateData = [
        'requester_surname' => $escape(ucwords(strtolower((string)($khidetails['surname'] ?? '')))),
        'employee_name' => $escape(getName($details['emp_number'])),
        'location_name' => $escape(getLocationName($details['location_id'])),
        'request_ref' => $escape($requestRef),
        'requester_name' => $escape(getName($details['requester_id'] ?? 0)),
        'group_abbr' => $escape(getGroupAbbreviation($details['emp_group'] ?? 0)),
        'dispatch_dates' => $dispatchDates,
        'kdt_cta_url' => $escape($kdtCtaUrl),
        'khi_cta_url' => $escape($khiCtaUrl),
        'logo_url' => $escape($logoUrl),
        'test_mode_placeholder' => '<!--DISPATCH_EMAIL_TEST_MODE-->',
    ];

    $msg = $isApproved
        ? buildDispatchRequestApprovedEmailHtml($templateData)
        : buildDispatchRequestDeclinedEmailHtml($templateData);

    return sendDispatchNotificationEmail($subject, $msg, $recipients);
}

function emailChangeRequestStatusChange($approved, array $details, array $changeData = []): bool
{
    $recipients = buildStatusChangeEmailRecipients($details);
    $khidetails = $recipients['khidetails'];
    $link = $recipients['link'];

    $changeType = strtolower(trim((string)($changeData['change_type'] ?? '')));
    $isCancellation = $changeType === 'cancellation';
    $typeLabel = $isCancellation ? 'cancellation' : 'date change';
    $typeTitle = $isCancellation ? 'Cancellation' : 'Date Change';
    $statusString = $approved ? 'approved' : 'declined';
    $subject = "Dispatch {$typeTitle} Request Status";
    $reason = htmlspecialchars((string)($changeData['reason'] ?? ''), ENT_QUOTES, 'UTF-8');

    // Date Change Request Approved / Declined — redesigned templates only
    if (!$isCancellation) {
        require_once __DIR__ . '/../helpers/datechange_email_templates.php';

        $escape = static function ($value): string {
            return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
        };
        $formatEmailDate = static function ($date) use ($escape): string {
            $raw = trim((string)$date);
            if ($raw === '') {
                return '';
            }
            $ts = strtotime($raw);
            if ($ts === false) {
                return $escape($raw);
            }
            return $escape(date('d M Y', $ts));
        };
        $formatNetChangeValue = static function (int $currentDays, int $proposedDays): string {
            $diff = $proposedDays - $currentDays;
            if ($diff === 0) {
                return '0';
            }
            if ($diff > 0) {
                return '+' . $diff;
            }
            return (string)$diff;
        };

        $originalFromRaw = $changeData['original_start_date'] ?? $details['dispatch_from'] ?? '';
        $originalToRaw = $changeData['original_end_date'] ?? $details['dispatch_to'] ?? '';
        $proposedFromRaw = $changeData['requested_start_date'] ?? '';
        $proposedToRaw = $changeData['requested_end_date'] ?? '';

        $originalFrom = $formatEmailDate($originalFromRaw);
        $originalTo = $formatEmailDate($originalToRaw);
        $proposedFrom = $formatEmailDate($proposedFromRaw);
        $proposedTo = $formatEmailDate($proposedToRaw);

        $summaryDispatchDates = trim(
            $originalFrom
            . ($originalFrom !== '' && $originalTo !== '' ? ' — ' : '')
            . $originalTo
        );
        $currentDates = trim(
            $originalFrom
            . ($originalFrom !== '' && $originalTo !== '' ? ' - ' : '')
            . $originalTo
        );
        $proposedDates = trim(
            $proposedFrom
            . ($proposedFrom !== '' && $proposedTo !== '' ? ' - ' : '')
            . $proposedTo
        );

        $currentDays = ($originalFromRaw !== '' && $originalToRaw !== '')
            ? countDays($originalFromRaw, $originalToRaw)
            : 0;
        $proposedDays = ($proposedFromRaw !== '' && $proposedToRaw !== '')
            ? countDays($proposedFromRaw, $proposedToRaw)
            : 0;

        $dispatchRequestId = (int)($details['request_id'] ?? 0);
        $reqRef = $dispatchRequestId > 0
            ? 'REQ-' . str_pad((string)$dispatchRequestId, 5, '0', STR_PAD_LEFT)
            : '';

        $changeRequestId = (int)($changeData['change_request_id'] ?? 0);
        $dcRef = trim((string)($changeData['display_id'] ?? ''));
        if ($dcRef === '' && $changeRequestId > 0) {
            $dcRef = 'DC-' . str_pad((string)$changeRequestId, 5, '0', STR_PAD_LEFT);
        }

        $deepLinkQuery = 'type=date_change&openChangeRequestId=' . rawurlencode((string)$changeRequestId);
        $kdtCtaUrl = $link . '/PCS/changeRequests/' . ($changeRequestId > 0 ? ('?' . $deepLinkQuery) : '');
        $khiCtaUrl = $link . '/PCSKHI/changeRequests/' . ($changeRequestId > 0 ? ('?' . $deepLinkQuery) : '');
        $logoUrl = getDispatchEmailLogoUrl();

        $baseTemplateData = [
            'requester_surname' => $escape(ucwords(strtolower((string)($khidetails['surname'] ?? '')))),
            'employee_name' => $escape(getName($details['emp_number'])),
            'location_name' => $escape(getLocationName($details['location_id'])),
            'group_abbr' => $escape(getGroupAbbreviation($details['emp_group'] ?? 0)),
            'dc_ref' => $escape($dcRef),
            'req_ref' => $escape($reqRef),
            'summary_dispatch_dates' => $summaryDispatchDates,
            'kdt_cta_url' => $escape($kdtCtaUrl),
            'khi_cta_url' => $escape($khiCtaUrl),
            'logo_url' => $escape($logoUrl),
            'test_mode_placeholder' => '<!--DISPATCH_EMAIL_TEST_MODE-->',
        ];

        if ($approved) {
            $netChange = $formatNetChangeValue((int)$currentDays, (int)$proposedDays);
            $subject = 'Date Change Request Approved';
            $msg = buildDateChangeRequestApprovedEmailHtml(array_merge($baseTemplateData, [
                'original_dates' => $currentDates,
                'updated_dates' => $proposedDates,
                'original_days' => (string)(int)$currentDays,
                'updated_days' => (string)(int)$proposedDays,
                'net_change' => $escape($netChange),
            ]));
        } else {
            $subject = 'Date Change Request Declined';
            $msg = buildDateChangeRequestDeclinedEmailHtml(array_merge($baseTemplateData, [
                'current_dates' => $currentDates,
                'proposed_dates' => $proposedDates,
                'current_days' => (string)(int)$currentDays,
                'proposed_days' => (string)(int)$proposedDays,
                'remaining_dates' => $currentDates,
            ]));
        }

        return sendDispatchNotificationEmail($subject, $msg, $recipients);
    }

    // Cancellation Request Approved — redesigned template
    if ($isCancellation && $approved) {
        require_once __DIR__ . '/../helpers/cancellation_email_templates.php';

        $escape = static function ($value): string {
            return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
        };
        $formatEmailDate = static function ($date) use ($escape): string {
            $raw = trim((string)$date);
            if ($raw === '') {
                return '';
            }
            $ts = strtotime($raw);
            if ($ts === false) {
                return $escape($raw);
            }
            return $escape(date('d M Y', $ts));
        };

        $dispatchFromRaw = $changeData['original_start_date'] ?? $details['dispatch_from'] ?? '';
        $dispatchToRaw = $changeData['original_end_date'] ?? $details['dispatch_to'] ?? '';
        $dispatchFrom = $formatEmailDate($dispatchFromRaw);
        $dispatchTo = $formatEmailDate($dispatchToRaw);
        $dispatchDates = trim(
            $dispatchFrom
            . ($dispatchFrom !== '' && $dispatchTo !== '' ? ' — ' : '')
            . $dispatchTo
        );

        $dispatchRequestId = (int)($details['request_id'] ?? 0);
        $reqRef = $dispatchRequestId > 0
            ? 'REQ-' . str_pad((string)$dispatchRequestId, 5, '0', STR_PAD_LEFT)
            : '';

        $changeRequestId = (int)($changeData['change_request_id'] ?? 0);
        $crRef = trim((string)($changeData['display_id'] ?? ''));
        if ($crRef === '' && $changeRequestId > 0) {
            $crRef = 'CR-' . str_pad((string)$changeRequestId, 5, '0', STR_PAD_LEFT);
        }

        $deepLinkQuery = 'type=cancellation&openChangeRequestId=' . rawurlencode((string)$changeRequestId);
        $kdtCtaUrl = $link . '/PCS/changeRequests/' . ($changeRequestId > 0 ? ('?' . $deepLinkQuery) : '');
        $khiCtaUrl = $link . '/PCSKHI/changeRequests/' . ($changeRequestId > 0 ? ('?' . $deepLinkQuery) : '');
        $logoUrl = getDispatchEmailLogoUrl();

        // Approval of a cancellation request cancels the original dispatch (existing business result).
        $originalDispatchStatus = 'Cancelled';

        $subject = 'Cancellation Request Approved';
        $msg = buildCancellationRequestApprovedEmailHtml([
            'requester_surname' => $escape(ucwords(strtolower((string)($khidetails['surname'] ?? '')))),
            'employee_name' => $escape(getName($details['emp_number'])),
            'location_name' => $escape(getLocationName($details['location_id'])),
            'group_abbr' => $escape(getGroupAbbreviation($details['emp_group'] ?? 0)),
            'cr_ref' => $escape($crRef),
            'req_ref' => $escape($reqRef),
            'dispatch_dates' => $dispatchDates,
            'reason' => $reason,
            'original_dispatch_status' => $escape($originalDispatchStatus),
            'kdt_cta_url' => $escape($kdtCtaUrl),
            'khi_cta_url' => $escape($khiCtaUrl),
            'logo_url' => $escape($logoUrl),
            'test_mode_placeholder' => '<!--DISPATCH_EMAIL_TEST_MODE-->',
        ]);

        return sendDispatchNotificationEmail($subject, $msg, $recipients);
    }

    // Cancellation Request Declined — redesigned template
    if ($isCancellation && !$approved) {
        require_once __DIR__ . '/../helpers/cancellation_email_templates.php';

        $escape = static function ($value): string {
            return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
        };
        $formatEmailDate = static function ($date) use ($escape): string {
            $raw = trim((string)$date);
            if ($raw === '') {
                return '';
            }
            $ts = strtotime($raw);
            if ($ts === false) {
                return $escape($raw);
            }
            return $escape(date('d M Y', $ts));
        };

        $dispatchFromRaw = $changeData['original_start_date'] ?? $details['dispatch_from'] ?? '';
        $dispatchToRaw = $changeData['original_end_date'] ?? $details['dispatch_to'] ?? '';
        $dispatchFrom = $formatEmailDate($dispatchFromRaw);
        $dispatchTo = $formatEmailDate($dispatchToRaw);
        $dispatchDates = trim(
            $dispatchFrom
            . ($dispatchFrom !== '' && $dispatchTo !== '' ? ' — ' : '')
            . $dispatchTo
        );

        $dispatchRequestId = (int)($details['request_id'] ?? 0);
        $reqRef = $dispatchRequestId > 0
            ? 'REQ-' . str_pad((string)$dispatchRequestId, 5, '0', STR_PAD_LEFT)
            : '';

        $changeRequestId = (int)($changeData['change_request_id'] ?? 0);
        $crRef = trim((string)($changeData['display_id'] ?? ''));
        if ($crRef === '' && $changeRequestId > 0) {
            $crRef = 'CR-' . str_pad((string)$changeRequestId, 5, '0', STR_PAD_LEFT);
        }

        $deepLinkQuery = 'type=cancellation&openChangeRequestId=' . rawurlencode((string)$changeRequestId);
        $kdtCtaUrl = $link . '/PCS/changeRequests/' . ($changeRequestId > 0 ? ('?' . $deepLinkQuery) : '');
        $khiCtaUrl = $link . '/PCSKHI/changeRequests/' . ($changeRequestId > 0 ? ('?' . $deepLinkQuery) : '');
        $logoUrl = getDispatchEmailLogoUrl();

        $subject = 'Cancellation Request Declined';
        $msg = buildCancellationRequestDeclinedEmailHtml([
            'requester_surname' => $escape(ucwords(strtolower((string)($khidetails['surname'] ?? '')))),
            'employee_name' => $escape(getName($details['emp_number'])),
            'location_name' => $escape(getLocationName($details['location_id'])),
            'group_abbr' => $escape(getGroupAbbreviation($details['emp_group'] ?? 0)),
            'cr_ref' => $escape($crRef),
            'req_ref' => $escape($reqRef),
            'dispatch_dates' => $dispatchDates,
            'reason' => $reason,
            'kdt_cta_url' => $escape($kdtCtaUrl),
            'khi_cta_url' => $escape($khiCtaUrl),
            'logo_url' => $escape($logoUrl),
            'test_mode_placeholder' => '<!--DISPATCH_EMAIL_TEST_MODE-->',
        ]);

        return sendDispatchNotificationEmail($subject, $msg, $recipients);
    }

    // Fallback legacy path (should not be reached for known change types)
    $detailRows = "
        <p>Date From: " . $details['dispatch_from'] . "</p>
        <p>Date To: " . $details['dispatch_to'] . "</p>
        <p>Location: " . getLocationName($details['location_id']) . "</p>
        <p>Reason: " . $reason . "</p>";

    $msg = "
                <html>
                <head>
                <title>Dispatch {$typeTitle} Request Status</title>
                </head>
                <body>
        <p>Dear " . ucwords(strtolower((string)($khidetails['surname'] ?? ''))) . "-san,</p>
        <p>We are writing to inform you that your {$typeLabel} request has been {$statusString}.</p>
        <p>Details:</p>
        <p>Employee: " . getName($details['emp_number']) . "</p>
        {$detailRows}
        <br>
        <p>For <strong>KDT</strong>, review the request details:</p>
        <ul>
            <li><a href='$link/PCS/changeRequests/'>Change Request List</a></li>
        </ul>
        <p>For <strong>KHI</strong>, track the request status:</p>
        <ul>
            <li><a href='$link/PCSKHI/changeRequests/'>Track Change Request Status</a></li>
        </ul>
        <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
        <p>Best regards,</p>
        <p>トラベる<br>KHI Design & Technical Services, Inc.</p>
         <p style='margin-top: 20px; font-size: 12px; color: #999;'>Please do not reply to this email as it is system generated.</p>
                </body>
                </html>
            ";

    return sendDispatchNotificationEmail($subject, $msg, $recipients);
}
function countDays($start, $end)
{
    $date1 = date_create($start);
    $date2 = date_create($end);
    $diff = date_diff($date1, $date2);
    return  (int)$diff->format("%a") + 1;
}
function checkRequestListAccess($empnum)
{
    global $connkdt;
    $access = FALSE;
    $permissionID = 43;
    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => $empnum, ":permissionID" => $permissionID]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = TRUE;
    }
    return $access;
}
function getWorkHistory($id)
{
    global $connpcs;
    $workHistory = array();
    $workQ = "SELECT * FROM `work_history` WHERE `emp_id`=:id ORDER BY `start_date`";
    $workStmt = $connpcs->prepare($workQ);
    $workStmt->execute([":id" => $id]);
    if ($workStmt->rowCount() > 0) {
        $workArr = $workStmt->fetchAll();
        foreach ($workArr as $work) {
            $output = array();
            $output['company_name'] = $work['comp_name'];
            $output['company_business'] = $work['comp_business'];
            $output['business_content'] = $work['business_cont'];
            $output['location'] = $work['work_loc'];
            $output['start_year'] = date("Y", strtotime($work['start_date']));
            $output['start_month'] = date("n", strtotime($work['start_date']));
            $output['end_year'] = !empty($work['end_date']) ? date("Y", strtotime($work['end_date'])) : null;
            $output['end_month'] = !empty($work['end_date']) ? date("n", strtotime($work['end_date'])) : null;
            $workHistory[] = $output;
        }
    }
    return $workHistory;
}
function getGroupManagersEmail($group_id)
{
    global $connnew;
    $matik = [19, 55]; //GM & SM
    $matikStmt = implode(",", $matik);
    $mgs = [17, 18]; //AM & DM
    $mgsStmt = implode(",", $mgs);
    $mgEmail = array();
    $emailQ = "SELECT DISTINCT `el`.email FROM `employee_list` el LEFT JOIN `employee_group` eg ON `el`.id=`eg`.employee_number WHERE (`el`.designation IN ($matikStmt) OR (`el`.designation IN ($mgsStmt) AND `eg`.group_id=:group_id)) AND (`el`.`resignation_date`>CURDATE() OR `el`.`resignation_date` IS NULL OR `el`.`resignation_date`='0000-00-00')";
    $emailStmt = $connnew->prepare($emailQ);
    $emailStmt->execute([":group_id" => $group_id]);
    if ($emailStmt->rowCount() > 0) {
        $mgArr = $emailStmt->fetchAll();
        foreach ($mgArr as $mg) {
            $mgEmail[] = $mg['email'];
        }
    }
    return $mgEmail;
}
function getAllowance($id)
{
    global $connpcs;
    $allowance = array();
    $allowanceQ = "SELECT `location_id`,`amount` FROM `allowance_list` WHERE `level_id` = IFNULL((SELECT `da`.level_id FROM `pcosdb`.designation_allowance da JOIN `kdtphdb_new`.employee_list el ON `da`.designation_id=`el`.designation WHERE el.id=:id),1)";
    $allowanceStmt = $connpcs->prepare($allowanceQ);
    $allowanceStmt->execute([":id" => $id]);
    if ($allowanceStmt->rowCount() > 0) {
        $allowance = $allowanceStmt->fetchAll();
    }
    return $allowance;
}
function getCompanyByDept($dept_id)
{
    global $connpcs;
    $comp_id = 0;
    $compQ = "SELECT `comp_id` FROM requesters_dep WHERE `id`=:dept_id";
    $compStmt = $connpcs->prepare($compQ);
    $compStmt->execute([":dept_id" => $dept_id]);
    if ($compStmt->rowCount() > 0) {
        $comp_id = $compStmt->fetchColumn();
    }
    return $comp_id;
}
function getCompanyDetails($comp_id)
{
    global $connpcs;
    $company_details = [
        "company_name" => "",
        "company_jap" => "",
        "company_desc" => ""
    ];
    $compQ = "SELECT * FROM `company_list` WHERE `id`=:comp_id";
    $compStmt = $connpcs->prepare($compQ);
    $compStmt->execute([":comp_id" => $comp_id]);
    if ($compStmt->rowCount() > 0) {
        $company_details = $compStmt->fetch();
    }
    return $company_details;
}
function getDispatchID($req_id){
    global $connpcs;
    $dispatch_id = NULL;
    $dQ = "SELECT `dispatch_id` FROM `dispatch_list` WHERE `request_id`=:req_id";
    $dStmt = $connpcs->prepare($dQ);
    $dStmt -> execute([":req_id" => $req_id]);
    if($dStmt->rowCount()>0){
        $dispatch_id = $dStmt->fetchColumn();
    }
    return $dispatch_id;
}
#endregion
