<?php

function getMemberIdsForEmployee(PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    $hasAllGroupAccess = hasPermission($connkdt, $employeeNumber, PCS_ALL_GROUP_PERMISSION);

    if ($hasAllGroupAccess) {
        $sql = "
            SELECT id
            FROM employee_list
            WHERE emp_status = 1
              AND nickname <> ''
              AND (
                    resignation_date IS NULL
                    OR resignation_date = '0000-00-00'
                    OR resignation_date > :yearMonth
              )
        ";

        $stmt = $connnew->prepare($sql);
        $stmt->execute([
            ':yearMonth' => date('Y-m-01'),
        ]);

        return array_map('strval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'id'));
    }

    $groupSql = "
        SELECT group_id
        FROM employee_group
        WHERE employee_number = :employeeNumber
    ";

    $groupStmt = $connnew->prepare($groupSql);
    $groupStmt->execute([
        ':employeeNumber' => $employeeNumber,
    ]);

    $groupIds = array_column($groupStmt->fetchAll(PDO::FETCH_ASSOC), 'group_id');

    if (empty($groupIds)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($groupIds), '?'));

    $memberSql = "
        SELECT id
        FROM employee_list
        WHERE group_id IN ($placeholders)
          AND emp_status = 1
          AND nickname <> ''
          AND (
                resignation_date IS NULL
                OR resignation_date = '0000-00-00'
                OR resignation_date > ?
          )
    ";

    $memberStmt = $connnew->prepare($memberSql);

    $params = array_map('strval', $groupIds);
    $params[] = date('Y-m-01');

    $memberStmt->execute($params);

    return array_map('strval', array_column($memberStmt->fetchAll(PDO::FETCH_ASSOC), 'id'));
}

function getDashboardDispatchList(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    $memberIds = getMemberIdsForEmployee($connnew, $connkdt, $employeeNumber);

    if (empty($memberIds)) {
        return [];
    }

    $passportWarningMonths = envInt('PASSPORT_EXPIRY_WARNING_MONTHS', 9);
    $visaWarningMonths = envInt('VISA_EXPIRY_WARNING_MONTHS', 6);
    $reentryWarningMonths = envInt('REENTRY_PERMIT_EXPIRY_WARNING_MONTHS', 6);

    if ($passportWarningMonths < 1) $passportWarningMonths = 9;
    if ($visaWarningMonths < 1) $visaWarningMonths = 6;
    if ($reentryWarningMonths < 1) $reentryWarningMonths = 6;

    $passportWarningCutoff = strtotime('+' . $passportWarningMonths . ' months');
    $visaWarningCutoff = strtotime('+' . $visaWarningMonths . ' months');
    $reentryWarningCutoff = strtotime('+' . $reentryWarningMonths . ' months');

    $placeholders = implode(',', array_fill(0, count($memberIds), '?'));

    $sql = "
        SELECT
            CONCAT(ed.firstname, ' ', ed.surname) AS ename,
            ll.location_name,
            dl.dispatch_from,
            dl.dispatch_to,

            pd.passport_expiry,
            pd.on_process AS passport_on_process,

            vd.visa_expiry,
            vd.on_process AS visa_on_process,

            rd.permit_expiry,
            rd.on_process AS reentry_on_process

        FROM dispatch_list AS dl
        JOIN kdtphdb_new.employee_list AS ed
            ON dl.emp_number = ed.id
        JOIN location_list AS ll
            ON dl.location_id = ll.location_id

        LEFT JOIN passport_details AS pd
            ON pd.emp_number = ed.id

        LEFT JOIN visa_details AS vd
            ON vd.emp_number = ed.id

        LEFT JOIN reentry_permit_details AS rd
            ON rd.emp_number = ed.id

        WHERE dl.dispatch_to >= ?
          AND ed.emp_status = 1
          AND ed.id IN ($placeholders)

        ORDER BY dl.dispatch_id DESC
    ";

    $stmt = $connpcs->prepare($sql);

    $params = [date('Y-m-d')];
    foreach ($memberIds as $memberId) {
        $params[] = $memberId;
    }

    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $dispatchList = [];

    foreach ($rows as $row) {
        $dispatchTo = $row['dispatch_to'];

        $passportStatus = 'invalid';
        $visaStatus = 'invalid';
        $reentryStatus = 'invalid';

        //PASSPORT
        if ((int)($row['passport_on_process'] ?? 0) === 1) {
            $passportStatus = 'on_process';
        } elseif (!empty($row['passport_expiry']) && strtotime($row['passport_expiry']) >= strtotime($dispatchTo)) {
            $ts = strtotime($row['passport_expiry']);
            $passportStatus = ($ts <= $passportWarningCutoff) ? 'valid_expiring' : 'valid';
        }

        //VISA
        if ((int)($row['visa_on_process'] ?? 0) === 1) {
            $visaStatus = 'on_process';
        } elseif (!empty($row['visa_expiry']) && strtotime($row['visa_expiry']) >= strtotime($dispatchTo)) {
            $ts = strtotime($row['visa_expiry']);
            $visaStatus = ($ts <= $visaWarningCutoff) ? 'valid_expiring' : 'valid';
        }

        //RE-ENTRY PERMIT
        if ((int)($row['reentry_on_process'] ?? 0) === 1) {
            $reentryStatus = 'on_process';
        } elseif (!empty($row['permit_expiry']) && strtotime($row['permit_expiry']) >= strtotime($dispatchTo)) {
            $ts = strtotime($row['permit_expiry']);
            $reentryStatus = ($ts <= $reentryWarningCutoff) ? 'valid_expiring' : 'valid';
        }

        $dispatchList[] = [
            'name' => ucwords(strtolower((string)$row['ename'])),
            'location' => $row['location_name'],
            'from' => date('d M Y', strtotime($row['dispatch_from'])),
            'to' => date('d M Y', strtotime($dispatchTo)),
            'passportStatus' => $passportStatus,
            'visaStatus' => $visaStatus,
            'reentryStatus' => $reentryStatus,
        ];
    }

    return $dispatchList;
}

function getDashboardSummary(PDO $connpcs): array
{
    $year = (int)date('Y');
    $summary = [];

    for ($month = 1; $month <= 12; $month++) {
        $monthEndDate = date('Y-m-t', strtotime(sprintf('%04d-%02d-01', $year, $month)));

        $sql = "
            SELECT COUNT(*) AS total
            FROM dispatch_list
            WHERE :monthEndDate BETWEEN dispatch_from AND dispatch_to
        ";

        $stmt = $connpcs->prepare($sql);
        $stmt->execute([
            ':monthEndDate' => $monthEndDate,
        ]);

        $dateObj = DateTime::createFromFormat('!m', (string)$month);

        $summary[] = [
            'month' => $dateObj->format('F'),
            'rate' => (int)$stmt->fetchColumn(),
        ];
    }

    return $summary;
}

function getExpiringPassports(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    $memberIds = getMemberIdsForEmployee($connnew, $connkdt, $employeeNumber);

    if (empty($memberIds)) {
        return [];
    }

    $warningMonths = envInt('PASSPORT_EXPIRY_WARNING_MONTHS', 9);

    if ($warningMonths < 1) {
        $warningMonths = 9;
    }

    $placeholders = implode(',', array_fill(0, count($memberIds), '?'));

    $sql = "
        SELECT
            CONCAT(ed.firstname, ' ', ed.surname) AS ename,
            TIMESTAMPDIFF(DAY, CURDATE(), pd.passport_expiry) AS expiring_in,
            ed.id
        FROM passport_details AS pd
        JOIN kdtphdb_new.employee_list AS ed
            ON pd.emp_number = ed.id
        WHERE pd.passport_expiry >= CURDATE()
          AND pd.passport_expiry <= DATE_ADD(CURDATE(), INTERVAL {$warningMonths} MONTH)
          AND ed.emp_status = 1
          AND ed.id IN ($placeholders)
        ORDER BY pd.passport_expiry ASC, ed.firstname ASC, ed.surname ASC
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute($memberIds);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $expiringList = [];

    foreach ($rows as $row) {
        $until = (int)$row['expiring_in'];

        if ($until < 0) {
            $until = 0;
        }

        $expiringList[] = [
            'name' => ucwords(strtolower((string)$row['ename'])),
            'id' => $row['id'],
            'until' => $until,
        ];
    }

    return $expiringList;
}

function getExpiringVisas(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    $memberIds = getMemberIdsForEmployee($connnew, $connkdt, $employeeNumber);

    if (empty($memberIds)) {
        return [];
    }

    $warningMonths = envInt('VISA_EXPIRY_WARNING_MONTHS', 6);

    if ($warningMonths < 1) {
        $warningMonths = 6;
    }

    $placeholders = implode(',', array_fill(0, count($memberIds), '?'));

    $sql = "
        SELECT
            CONCAT(ed.firstname, ' ', ed.surname) AS ename,
            TIMESTAMPDIFF(DAY, CURDATE(), vd.visa_expiry) AS expiring_in,
            ed.id
        FROM visa_details AS vd
        JOIN kdtphdb_new.employee_list AS ed
            ON vd.emp_number = ed.id
        WHERE vd.visa_expiry >= CURDATE()
          AND vd.visa_expiry <= DATE_ADD(CURDATE(), INTERVAL {$warningMonths} MONTH)
          AND ed.emp_status = 1
          AND ed.id IN ($placeholders)
        ORDER BY vd.visa_expiry ASC, ed.firstname ASC, ed.surname ASC
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute($memberIds);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $expiringList = [];

    foreach ($rows as $row) {
        $until = (int)$row['expiring_in'];

        if ($until < 0) {
            $until = 0;
        }

        $expiringList[] = [
            'name' => ucwords(strtolower((string)$row['ename'])),
            'id' => $row['id'],
            'until' => $until,
        ];
    }

    return $expiringList;
}