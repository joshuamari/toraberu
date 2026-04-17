<?php

function getAvailableReportYears(PDO $connpcs): array
{
    $currentYear = (int)date('Y');

    $sql = "
        SELECT DISTINCT YEAR(dispatch_from) AS year_value
        FROM dispatch_list

        UNION

        SELECT DISTINCT YEAR(dispatch_to) AS year_value
        FROM dispatch_list
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $years = [];

    foreach ($rows as $year) {
        if ($year !== null) {
            $years[] = (int)$year;
        }
    }

    if (!in_array($currentYear, $years, true)) {
        $years[] = $currentYear;
    }

    sort($years);

    return array_values($years);
}

function getDispatchReport(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $employeeNumber,
    string $selectedYear,
    ?string $groupId
): array {

    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if (!preg_match('/^\d{4}$/', $selectedYear)) {
        throw new RuntimeException('Invalid year selected.');
    }

    $accessibleGroupIds = getAccessibleGroupIds($connnew, $connkdt, $employeeNumber);

    if (empty($accessibleGroupIds)) {
        return [];
    }

    $selectedGroupIds = array_values(array_map('intval', $accessibleGroupIds));

    if ($groupId !== null && $groupId !== '' && $groupId !== '0') {
        if (!ctype_digit((string)$groupId)) {
            throw new RuntimeException('Invalid group ID.');
        }

        $gid = (int)$groupId;

        if (!in_array($gid, $selectedGroupIds, true)) {
            throw new RuntimeException('Access denied.');
        }

        $selectedGroupIds = [$gid];
    }

    $reportStart = $selectedYear . '-01-01';
    $startYear = $selectedYear . '-01-01';
    $endYear = $selectedYear . '-12-31';

    $groupPlaceholders = implode(',', array_fill(0, count($selectedGroupIds), '?'));

    $groupSql = "
        SELECT
            gl.id AS newID,
            gl.name
        FROM group_list gl
        WHERE gl.id IN ($groupPlaceholders)
        ORDER BY gl.name
    ";

    $groupStmt = $connnew->prepare($groupSql);
    $groupStmt->execute(array_values($selectedGroupIds));
    $groups = $groupStmt->fetchAll(PDO::FETCH_ASSOC);

    $finalReport = [];

    foreach ($groups as $groupRow) {
        $oneGroupID = (int)$groupRow['newID'];
        $groupName = $groupRow['name'];

        $employeeSql = "
            SELECT
                ed.id,
                CONCAT(UPPER(ed.surname), ', ', ed.firstname) AS empName,
                gl.abbreviation AS groupName,
                vd.visa_issue AS visaIssue,
                vd.visa_expiry AS visaExpiry,
                rd.permit_expiry AS reentryExpiry
            FROM kdtphdb_new.employee_list ed
            LEFT JOIN kdtphdb_new.group_list gl
                ON ed.group_id = gl.id
            LEFT JOIN visa_details vd
                ON ed.id = vd.emp_number
            LEFT JOIN reentry_permit_details rd
                ON ed.id = rd.emp_number
            WHERE ed.group_id = :groupId
            AND (
                    ed.date_hired IS NULL
                    OR ed.date_hired = '0000-00-00'
                    OR ed.date_hired <= :reportEnd
                )
            AND (
                    ed.resignation_date IS NULL
                    OR ed.resignation_date = '0000-00-00'
                    OR ed.resignation_date >= :reportStart
                )
            ORDER BY ed.id
        ";

        $employeeStmt = $connpcs->prepare($employeeSql);
        $employeeStmt->execute([
            ':groupId' => $oneGroupID,
            ':reportStart' => $reportStart,
            ':reportEnd' => $endYear,
        ]);

        $employees = $employeeStmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($employees)) {
            continue;
        }

        $userArray = [];

        foreach ($employees as $employeeRow) {
            $empID = (int)$employeeRow['id'];

            $dispatchSql = "
                SELECT dispatch_from, dispatch_to
                FROM dispatch_list
                WHERE emp_number = :empID
                  AND (
                        (dispatch_from >= :startYear1 AND dispatch_from <= :endYear1)
                        OR
                        (dispatch_to <= :endYear2 AND dispatch_to >= :startYear2)
                  )
                ORDER BY dispatch_from DESC
            ";

            $dispatchStmt = $connpcs->prepare($dispatchSql);
            $dispatchStmt->execute([
                ':empID' => $empID,
                ':startYear1' => $startYear,
                ':endYear1' => $endYear,
                ':startYear2' => $startYear,
                ':endYear2' => $endYear,
            ]);

            $dispatchRows = $dispatchStmt->fetchAll(PDO::FETCH_ASSOC);

            $days = 0;
            $dispatchArray = [];

            foreach ($dispatchRows as $dispatchRow) {
                $fromDate = $dispatchRow['dispatch_from'];
                $toDate = $dispatchRow['dispatch_to'];

                $duration = countDispatchDaysWithinYear($fromDate, $toDate, $selectedYear);
                $days += $duration;

                $dispatchArray[] = [
                    'dispatch_from' => $fromDate ? date('d M Y', strtotime($fromDate)) : 'None',
                    'dispatch_to' => $toDate ? date('d M Y', strtotime($toDate)) : 'None',

                    // COMMENT THIS BACK IN IF CLIENT WANTS TOTAL PAST 1 YEAR AGAIN
                    // 'totalPast' => getPastOneYear($connpcs, $empID, $toDate),

                    'duration' => $duration,
                ];
            }

            $userArray[] = [
                'id' => $empID,
                'empName' => $employeeRow['empName'],
                'groupName' => $employeeRow['groupName'],
                'visaExpiry' => formatVisaSummary(
                    $employeeRow['visaIssue'] ?? null,
                    $employeeRow['visaExpiry'] ?? null
                ),
                'reentryExpiry' => !empty($employeeRow['reentryExpiry'])
                    ? date('d M Y', strtotime($employeeRow['reentryExpiry']))
                    : 'None',
                'dispatch' => $dispatchArray,
                'totalDays' => $days,
            ];
        }

        $finalReport[$groupName] = $userArray;
    }

    return $finalReport;
}

function countDispatchDaysWithinYear(?string $dateFrom, ?string $dateTo, string $yearNow): int
{
    if (!$dateFrom || !$dateTo || $dateFrom > $dateTo) {
        return 0;
    }

    $dateFromYear = date('Y', strtotime($dateFrom));
    $dateToYear = date('Y', strtotime($dateTo));

    if ($dateFromYear != $yearNow && $dateToYear == $yearNow) {
        $startYear = $yearNow . '-01-01';
        $endYear = $dateTo;
    } elseif ($dateFromYear == $yearNow && $dateToYear == $yearNow) {
        $startYear = $dateFrom;
        $endYear = $dateTo;
    } elseif ($dateFromYear == $yearNow && $dateToYear != $yearNow) {
        $startYear = $dateFrom;
        $endYear = $yearNow . '-12-31';
    } else {
        $startYear = $yearNow . '-12-31';
        $endYear = $yearNow . '-12-31';
    }

    $startDate = new DateTime($startYear);
    $endDate = new DateTime($endYear);

    return $startDate->diff($endDate)->days + 1;
}

function convertSecondsToYears(int $secs): int
{
    $secs += 86400;
    $secondsInAYear = 365 * 24 * 60 * 60;

    return (int)floor($secs / $secondsInAYear);
}

function convertSecondsToMonths(int $secs): int
{
    $secs += 86400;
    $secondsInAMonth = 2628000;

    return (int)floor($secs / $secondsInAMonth);
}

function formatVisaSummary(?string $visaIssue, ?string $visaExpiry): string
{
    if (!$visaIssue || !$visaExpiry) {
        return 'None';
    }

    $vExp = strtotime($visaExpiry);
    $vIssue = strtotime($visaIssue);

    $difference = convertSecondsToYears($vExp - $vIssue);
    $visaDiff = $difference . ' year/s ';

    if ($difference === 0) {
        $difference = convertSecondsToMonths($vExp - $vIssue);
        $visaDiff = $difference . ' month/s ';
    }

    return 'ICT VISA ' . $visaDiff . date('m/d/Y', $vExp);
}

function getPastOneYear(PDO $connpcs, int $empID, ?string $lastDay): int
{
    if (!$lastDay) {
        return 0;
    }

    $firstDay = date('Y-m-d', strtotime($lastDay . ' -1 year'));

    $sql = "
        SELECT SUM(
            DATEDIFF(
                LEAST(:endYear1, dispatch_to),
                GREATEST(:startYear1, dispatch_from)
            ) + 1
        ) AS days_in_year
        FROM dispatch_list
        WHERE emp_number = :empID
          AND dispatch_from >= :startYear2
          AND dispatch_to <= :endYear2
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':empID' => $empID,
        ':startYear1' => $firstDay,
        ':endYear1' => $lastDay,
        ':startYear2' => $firstDay,
        ':endYear2' => $lastDay,
    ]);

    return (int)($stmt->fetchColumn() ?: 0);
}