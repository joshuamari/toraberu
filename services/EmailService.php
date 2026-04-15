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

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $baseUrl = $protocol . '://' . $host;

    $statusString = ((int)$status === 1) ? 'accepted' : 'cancelled';
    $subject = 'Dispatch Request Status';

    $requesterSurname = ucwords(strtolower((string)($khiDetails['surname'] ?? 'User')));
    $employeeName = getEmployeeDisplayName($connnew, $connpcs, $employeeId);
    $locationName = getLocationNameForEmail($connpcs, (int)($details['location_id'] ?? 0));

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";

    $fromAddress = trim((string)env('MAIL_FROM_ADDRESS', ''));
    $fromName = trim((string)env('MAIL_FROM_NAME', 'PCS System'));

    if ($fromAddress !== '') {
        $headers .= "From: {$fromName} <{$fromAddress}>\r\n";
    }

    if ($cc !== '') {
        $headers .= "CC: {$cc}\r\n";
    }

    $body = "
        <html>
        <head>
            <title>Dispatch Request</title>
        </head>
        <body>
            <p>Dear {$requesterSurname}-san,</p>
            <p>We are writing to inform you that your request has been {$statusString}.</p>
            <p>Details:</p>
            <p>Employee: {$employeeName}</p>
            <p>Date From: {$details['dispatch_from']}</p>
            <p>Date To: {$details['dispatch_to']}</p>
            <p>Location: {$locationName}</p>
            <p>Date Requested: {$details['date_requested']}</p>
            <br>
            <p>For <strong>KDT</strong>, review the request details:</p>
            <ul>
                <li><a href='{$baseUrl}/PCS/requestList/'>Dispatch Request List</a></li>
            </ul>
            <p>For <strong>KHI</strong>, track the request status:</p>
            <ul>
                <li><a href='{$baseUrl}/PCSKHI/requestList/'>Track Request Status</a></li>
            </ul>
            <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
            <p>Best regards,</p>
            <p>トラベる<br>KHI Design & Technical Service, Inc.</p>
            <p style='margin-top: 20px; font-size: 12px; color: #999;'>Please do not reply to this email as it is system generated.</p>
        </body>
        </html>
    ";

    return sendSystemEmail($to, $subject, $body, $headers);
}