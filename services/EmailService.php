<?php

function getKhiUserDetailsById(PDO $connpcs, int $id): array
{
    $sql = "SELECT surname, email FROM khi_details WHERE number = :id LIMIT 1";
    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':id' => $id,
    ]);

    return $stmt->fetch(PDO::FETCH_ASSOC) ?: [
        'surname' => '',
        'email' => '',
    ];
}

function getAdminEmails(PDO $connnew): array
{
    $exclude = [29, 40, 43, 44, 45, 49, 51, 53];
    $excludeStmt = implode(',', $exclude);

    $sql = "
        SELECT email
        FROM employee_list
        WHERE group_id = :group_id
          AND designation NOT IN ($excludeStmt)
          AND (
                resignation_date > CURDATE()
                OR resignation_date IS NULL
                OR resignation_date = '0000-00-00'
              )
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':group_id' => 2,
    ]);

    return array_values(array_filter(array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'email')));
}

function getKhiPicEmails(PDO $connpcs, int $groupId, int $excludeId = 0): array
{
    $sql = "
        SELECT email
        FROM khi_details
        WHERE group_id = :group_id
          AND number != :exclude_id
          AND is_active = 1
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':group_id' => $groupId,
        ':exclude_id' => $excludeId,
    ]);

    return array_values(array_filter(array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'email')));
}

function getKhiAdminEmails(PDO $connpcs): array
{
    $sql = "
        SELECT email
        FROM khi_details
        WHERE group_id = 2
          AND number != 905007
          AND is_active = 1
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute();

    return array_values(array_filter(array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'email')));
}

function getGroupManagerEmails(PDO $connnew, int $groupId): array
{
    $matik = [19, 55]; // GM & SM
    $mgs = [17, 18];   // AM & DM

    $matikStmt = implode(',', $matik);
    $mgsStmt = implode(',', $mgs);

    $sql = "
        SELECT DISTINCT el.email
        FROM employee_list el
        LEFT JOIN employee_group eg
            ON el.id = eg.employee_number
        WHERE (
                el.designation IN ($matikStmt)
                OR (el.designation IN ($mgsStmt) AND eg.group_id = :group_id)
              )
          AND (
                el.resignation_date > CURDATE()
                OR el.resignation_date IS NULL
                OR el.resignation_date = '0000-00-00'
              )
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':group_id' => $groupId,
    ]);

    return array_values(array_filter(array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'email')));
}

function getPresidentEmail(PDO $connnew): string
{
    $sql = "
        SELECT email
        FROM employee_list
        WHERE designation = 29
          AND (
                resignation_date IS NULL
                OR resignation_date = '0000-00-00'
                OR resignation_date > CURDATE()
              )
        LIMIT 1
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute();

    return trim((string)($stmt->fetchColumn() ?: ''));
}

function getEmployeeGroupId(PDO $connnew, int $employeeId): int
{
    $sql = "SELECT group_id FROM employee_list WHERE id = :id LIMIT 1";
    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':id' => $employeeId,
    ]);

    return (int)($stmt->fetchColumn() ?: 0);
}

function getLocationNameForEmail(PDO $connpcs, int $locationId): string
{
    $sql = "SELECT location_name FROM location_list WHERE location_id = :location_id LIMIT 1";
    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':location_id' => $locationId,
    ]);

    return (string)($stmt->fetchColumn() ?: '');
}

function getGroupAbbreviationForEmail(PDO $connnew, int $groupId): string
{
    if ($groupId <= 0) {
        return '';
    }

    $sql = "SELECT abbreviation FROM group_list WHERE id = :id LIMIT 1";
    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':id' => $groupId,
    ]);

    $abbr = $stmt->fetchColumn();
    return $abbr !== false ? (string)$abbr : '';
}

function formatDispatchEmailDate($date): string
{
    $raw = trim((string)$date);
    if ($raw === '') {
        return '';
    }

    $ts = strtotime($raw);
    if ($ts === false) {
        return $raw;
    }

    return date('d M Y', $ts);
}

function sendRequestStatusChangeEmail(PDO $connpcs, PDO $connnew, int $status, array $details): bool
{
    $requesterId = (int)($details['requester_id'] ?? 0);
    $employeeId = (int)($details['emp_number'] ?? 0);

    if ($requesterId <= 0 || $employeeId <= 0) {
        error_log('sendRequestStatusChangeEmail skipped: missing requester_id or emp_number.');
        return false;
    }

    $khiDetails = getKhiUserDetailsById($connpcs, $requesterId);
    $to = trim((string)($khiDetails['email'] ?? ''));

    if ($to === '') {
        error_log('sendRequestStatusChangeEmail skipped: requester email not found.');
        return false;
    }

    $empGroup = (int)($details['emp_group'] ?? 0);
    if ($empGroup <= 0) {
        $empGroup = getEmployeeGroupId($connnew, $employeeId);
    }

    $groupForRecipients = ((int)($details['dept_id'] ?? 0) === 15) ? 21 : $empGroup;

$admins = getAdminEmails($connnew);
$khiPic = getKhiPicEmails($connpcs, $groupForRecipients, $requesterId);
$khiAdmins = getKhiAdminEmails($connpcs);
$kdtManagers = getGroupManagerEmails($connnew, $groupForRecipients);
$presEmail = getPresidentEmail($connnew);

// Build base CC (excluding president)
$baseCc = array_merge(
    $khiPic,
    $khiAdmins,
    $kdtManagers,
    $admins
);

// Put president FIRST
$ccArray = [];

if ($presEmail !== '') {
    $ccArray[] = $presEmail;
}

// Then add the rest
$ccArray = array_merge($ccArray, $baseCc);

// Final cleanup
$ccArray = array_values(array_unique(array_filter($ccArray)));

$cc = implode(',', $ccArray);

    // DEBUG LOGS
    error_log('EMAIL RECIPIENT BREAKDOWN START');
    error_log('Requester To: ' . $to);
    error_log('Employee ID: ' . $employeeId);
    error_log('Requester ID: ' . $requesterId);
    error_log('Group for Recipients: ' . $groupForRecipients);
    error_log('KHI PIC: ' . (!empty($khiPic) ? implode(',', $khiPic) : '(none)'));
    error_log('KHI Admins: ' . (!empty($khiAdmins) ? implode(',', $khiAdmins) : '(none)'));
    error_log('KDT Managers: ' . (!empty($kdtManagers) ? implode(',', $kdtManagers) : '(none)'));
    error_log('Admins: ' . (!empty($admins) ? implode(',', $admins) : '(none)'));
    error_log('President: ' . ($presEmail !== '' ? $presEmail : '(none)'));
    error_log('Final CC: ' . ($cc !== '' ? $cc : '(none)'));
    error_log('EMAIL RECIPIENT BREAKDOWN END');

    $baseUrl = getEmailPublicBaseUrl();

    $isApproved = ((int)$status === 1);
    $subject = $isApproved ? 'Dispatch Request Approved' : 'Dispatch Request Declined';

    $requesterSurname = ucwords(strtolower((string)($khiDetails['surname'] ?? 'User')));
    $employeeName = getEmployeeDisplayName($connnew, $connpcs, $employeeId);
    $locationName = getLocationNameForEmail($connpcs, (int)($details['location_id'] ?? 0));

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";

    $fromAddress = trim((string)env('MAIL_FROM_ADDRESS', 'kdt_toraberu@global.kawasaki.com'));

    if ($fromAddress !== '') {
        $headers .= "From: {$fromAddress}\r\n";
    }

    if ($cc !== '') {
        $headers .= "CC: {$cc}\r\n";
    }

    require_once __DIR__ . '/../helpers/dispatch_email_templates.php';

    $escape = static function ($value): string {
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
    };

    $requestId = (int)($details['request_id'] ?? 0);
    $requestRef = $requestId > 0
        ? 'REQ-' . str_pad((string)$requestId, 5, '0', STR_PAD_LEFT)
        : '';

    $dispatchFrom = formatDispatchEmailDate($details['dispatch_from'] ?? '');
    $dispatchTo = formatDispatchEmailDate($details['dispatch_to'] ?? '');
    $dispatchDates = trim(
        $dispatchFrom
        . ($dispatchFrom !== '' && $dispatchTo !== '' ? ' — ' : '')
        . $dispatchTo
    );

    $requesterName = getEmployeeDisplayName($connnew, $connpcs, $requesterId);
    $groupAbbr = getGroupAbbreviationForEmail($connnew, $empGroup);

    $kdtCtaUrl = $requestId > 0
        ? $baseUrl . '/PCS/requestList/?open_request=' . rawurlencode((string)$requestId)
        : $baseUrl . '/PCS/requestList/';
    $khiCtaUrl = $requestId > 0
        ? $baseUrl . '/PCSKHI/requestList/?request_id=' . rawurlencode((string)$requestId)
        : $baseUrl . '/PCSKHI/requestList/';
    $logoUrl = getEmailLogoUrl();

    $templateData = [
        'requester_surname' => $escape($requesterSurname),
        'employee_name' => $escape($employeeName),
        'location_name' => $escape($locationName),
        'request_ref' => $escape($requestRef),
        'requester_name' => $escape($requesterName),
        'group_abbr' => $escape($groupAbbr),
        'dispatch_dates' => $escape($dispatchDates),
        'kdt_cta_url' => $escape($kdtCtaUrl),
        'khi_cta_url' => $escape($khiCtaUrl),
        'logo_url' => $escape($logoUrl),
        'test_mode_placeholder' => '<!--EMAIL_TEST_MODE-->',
    ];

    $body = $isApproved
        ? buildDispatchRequestApprovedEmailHtml($templateData)
        : buildDispatchRequestDeclinedEmailHtml($templateData);

    return sendSystemEmail($to, $subject, $body, $headers);
}