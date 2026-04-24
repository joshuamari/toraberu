<?php

function getEmployeePictureLink(int $employeeId): string
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $baseUrl = $protocol . '://' . $host;

    $defaultLink = "{$baseUrl}/QMS/Profilev2/defaultqmsphoto.png";
    $version = date('YmdHis');
    $yearNow = (int)date('Y');

    for ($year = $yearNow; $year >= 2021; $year--) {
        $absolutePath = "C:/xampp/htdocs/QMS/Profilev2/{$year}/pic_{$employeeId}.jpg";

        if (file_exists($absolutePath)) {
            return "{$baseUrl}/QMS/Profilev2/{$year}/pic_{$employeeId}.jpg?version={$version}";
        }
    }

    return $defaultLink;
}

function getEmployeeBasicDetails(
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId
): array {
    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $accessibleMemberIds = getMemberIdsForEmployee($connnew, $connkdt, $viewerEmployeeNumber);

    if (!in_array((string)$employeeId, $accessibleMemberIds, true)) {
        throw new RuntimeException('Access denied.');
    }

    $sql = "
        SELECT
            id,
            surname AS lastname,
            firstname,
            emp_status AS dispatch
        FROM employee_list
        WHERE id = :employeeId
        LIMIT 1
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    $employee = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$employee) {
        throw new RuntimeException('Employee not found.');
    }

    $employee['id'] = (int)$employee['id'];
    $employee['dispatch'] = (int)$employee['dispatch'];
    $employee['firstname'] = ucwords(strtolower((string)$employee['firstname']));
    $employee['lastname'] = ucwords(strtolower((string)$employee['lastname']));
    $employee['pictureLink'] = getEmployeePictureLink((int)$employee['id']);

    return $employee;
}

function getPassportFileLink(int $employeeId): string
{
    $relativePath = "../EmployeesFolder/{$employeeId}/passport.pdf";
    $publicPath = "./EmployeesFolder/{$employeeId}/passport.pdf";
    $version = date('YmdHis');

    if (file_exists($relativePath)) {
        return "{$publicPath}?version={$version}";
    }

    return '';
}

function getEmployeePassport(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId,
    bool $isDetails
): array {
    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $accessibleMemberIds = getMemberIdsForEmployee($connnew, $connkdt, $viewerEmployeeNumber);

    if (!in_array((string)$employeeId, $accessibleMemberIds, true)) {
        throw new RuntimeException('Access denied.');
    }

    $sql = "
        SELECT
            passport_number AS number,
            passport_birthdate AS bday,
            passport_issue AS issue,
            passport_expiry AS expiry,
            on_process
        FROM passport_details
        WHERE emp_number = :employeeId
        LIMIT 1
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    $passport = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$passport) {
        return [];
    }

    $status = 'invalid';

    if ((int)($passport['on_process'] ?? 0) === 1) {
        $status = 'on_process';
    } elseif (!empty($passport['expiry'])) {
        $expiryTs = strtotime($passport['expiry']);
        $todayTs = strtotime(date('Y-m-d'));

        if ($expiryTs >= $todayTs) {
            $warningMonths = envInt('PASSPORT_EXPIRY_WARNING_MONTHS', 9);

            if ($warningMonths < 1) {
                $warningMonths = 9;
            }

            $warningCutoff = strtotime('+' . $warningMonths . ' months');

            $status = ($expiryTs <= $warningCutoff) ? 'valid_expiring' : 'valid';
        }
    }

    if ($isDetails) {
        if (!empty($passport['bday'])) {
            $passport['bday'] = date('d M Y', strtotime($passport['bday']));
        }
        if (!empty($passport['issue'])) {
            $passport['issue'] = date('d M Y', strtotime($passport['issue']));
        }
        if (!empty($passport['expiry'])) {
            $passport['expiry'] = date('d M Y', strtotime($passport['expiry']));
        }
    }

    $passport['passportLink'] = getPassportFileLink($employeeId);
    $passport['status'] = $status;
    $passport['on_process'] = (int)($passport['on_process'] ?? 0);

    return $passport;
}

function getVisaFileLink(int $employeeId): string
{
    $relativePath = "../EmployeesFolder/{$employeeId}/visa.pdf";
    $publicPath = "./EmployeesFolder/{$employeeId}/visa.pdf";
    $version = date('YmdHis');

    if (file_exists($relativePath)) {
        return "{$publicPath}?version={$version}";
    }

    return '';
}

function getEmployeeVisa(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId,
    bool $isDetails
): array {
    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $accessibleMemberIds = getMemberIdsForEmployee($connnew, $connkdt, $viewerEmployeeNumber);

    if (!in_array((string)$employeeId, $accessibleMemberIds, true)) {
        throw new RuntimeException('Access denied.');
    }

    $sql = "
        SELECT
            visa_number AS number,
            visa_issue AS issue,
            visa_expiry AS expiry,
            on_process
        FROM visa_details
        WHERE emp_number = :employeeId
        LIMIT 1
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    $visa = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$visa) {
        return [];
    }

    $status = 'invalid';

    if ((int)($visa['on_process'] ?? 0) === 1) {
        $status = 'on_process';
    } elseif (!empty($visa['expiry'])) {
        $expiryTs = strtotime($visa['expiry']);
        $todayTs = strtotime(date('Y-m-d'));

        if ($expiryTs >= $todayTs) {
            $warningMonths = envInt('VISA_EXPIRY_WARNING_MONTHS', 6);

            if ($warningMonths < 1) {
                $warningMonths = 6;
            }

            $warningCutoff = strtotime('+' . $warningMonths . ' months');

            $status = ($expiryTs <= $warningCutoff) ? 'valid_expiring' : 'valid';
        }
    }

    if ($isDetails) {
        if (!empty($visa['issue'])) {
            $visa['issue'] = date('d M Y', strtotime($visa['issue']));
        }
        if (!empty($visa['expiry'])) {
            $visa['expiry'] = date('d M Y', strtotime($visa['expiry']));
        }
    }

    $visa['visaLink'] = getVisaFileLink($employeeId);
    $visa['status'] = $status;
    $visa['on_process'] = (int)($visa['on_process'] ?? 0);

    return $visa;
}

function getDispatchDaysPastOneYear(PDO $connpcs, int $employeeId, string $lastDay): int
{
    $firstDay = date('Y-m-d', strtotime($lastDay . ' -1 year'));

    $sql = "
        SELECT SUM(
            DATEDIFF(
                LEAST(:endYear1, dispatch_to),
                GREATEST(:startYear1, dispatch_from)
            ) + 1
        ) AS days_in_year
        FROM dispatch_list
        WHERE dispatch_from >= :startYear2
          AND dispatch_to <= :endYear2
          AND emp_number = :empID
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':startYear1' => $firstDay,
        ':endYear1' => $lastDay,
        ':startYear2' => $firstDay,
        ':endYear2' => $lastDay,
        ':empID' => $employeeId,
    ]);

    return (int)$stmt->fetchColumn();
}

function getEmployeeDispatchHistory(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId
): array {
    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $sql = "
        SELECT
            dl.dispatch_id AS id,
            dl.dispatch_from AS fromDate,
            dl.dispatch_to AS toDate,
            ll.location_name AS locationName
        FROM dispatch_list dl
        LEFT JOIN location_list ll
            ON dl.location_id = ll.location_id
        WHERE dl.emp_number = :empID
        ORDER BY dl.dispatch_from DESC
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':empID' => $employeeId,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $dispatch = [];

    foreach ($rows as $row) {
        if (empty($row['fromDate']) || empty($row['toDate'])) {
            continue;
        }

        $from = new DateTime($row['fromDate']);
        $to = new DateTime($row['toDate']);

        $difference = $from->diff($to)->days;

        $dispatch[] = [
            'id' => (int)$row['id'],
            'fromDate' => date('d M Y', strtotime($row['fromDate'])),
            'toDate' => date('d M Y', strtotime($row['toDate'])),
            'locationName' => $row['locationName'],
            'duration' => $difference + 1,
        ];
    }

    return $dispatch;
}

function calculateOverlapDaysCurrentYear(string $from, string $to): int
{
    if (empty($from) || empty($to) || $from > $to) {
        return 0;
    }

    $year = date('Y');
    $yearStart = "{$year}-01-01";
    $yearEnd = "{$year}-12-31";

    // clamp range to current year
    $start = max($from, $yearStart);
    $end = min($to, $yearEnd);

    if ($start > $end) {
        return 0;
    }

    $startDate = new DateTime($start);
    $endDate = new DateTime($end);

    return $startDate->diff($endDate)->days + 1;
}

function getEmployeeDispatchDaysCurrentYear(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId
): int {
    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $yearStart = date("Y-01-01");
    $yearEnd = date("Y-12-31");

    $sql = "
        SELECT dispatch_from, dispatch_to
        FROM dispatch_list
        WHERE emp_number = :empID
        AND (
            (dispatch_from BETWEEN :startYear1 AND :endYear1)
            OR
            (dispatch_to BETWEEN :startYear2 AND :endYear2)
        )
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':empID' => $employeeId,
        ':startYear1' => $yearStart,
        ':endYear1' => $yearEnd,
        ':startYear2' => $yearStart,
        ':endYear2' => $yearEnd,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total = 0;

    foreach ($rows as $row) {
        if (empty($row['dispatch_from']) || empty($row['dispatch_to'])) {
            continue;
        }

        $total += calculateOverlapDaysCurrentYear(
            $row['dispatch_from'],
            $row['dispatch_to']
        );
    }

    return $total;
}

function deleteDispatchRecord(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $dispatchId
): void {
    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $checkSql = "
        SELECT dispatch_id
        FROM dispatch_list
        WHERE dispatch_id = :dispatchId
        LIMIT 1
    ";

    $checkStmt = $connpcs->prepare($checkSql);
    $checkStmt->execute([
        ':dispatchId' => $dispatchId,
    ]);

    if (!$checkStmt->fetch()) {
        throw new RuntimeException('Dispatch not found.');
    }

    $deleteSql = "
        DELETE FROM dispatch_list
        WHERE dispatch_id = :dispatchId
    ";

    $deleteStmt = $connpcs->prepare($deleteSql);
    $deleteStmt->execute([
        ':dispatchId' => $dispatchId,
    ]);

    if ($deleteStmt->rowCount() === 0) {
        throw new RuntimeException('Failed to delete dispatch.');
    }
}

function getDispatchRecordById(PDO $connpcs, int $dispatchId): ?array
{
    $sql = "
        SELECT dispatch_id, emp_number, location_id, dispatch_from, dispatch_to
        FROM dispatch_list
        WHERE dispatch_id = :dispatchID
        LIMIT 1
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':dispatchID' => $dispatchId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function hasDispatchOverlap(PDO $connpcs, int $employeeId, array $range, int $excludeDispatchId): bool
{
    $start = $range['start'];
    $end = $range['end'];

    $sql = "
        SELECT 1
        FROM dispatch_list
        WHERE emp_number = :empnum
          AND dispatch_id != :excludeId
          AND dispatch_from <= :endDate
          AND dispatch_to >= :startDate
        LIMIT 1
    ";

    $stmt = $connpcs->prepare($sql);

    $stmt->execute([
        ':empnum' => $employeeId,
        ':excludeId' => $excludeDispatchId,
        ':startDate' => $start,
        ':endDate' => $end,
    ]);

    return (bool)$stmt->fetchColumn();
}

function updateDispatchRecord(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $dispatchId,
    int $locationId,
    string $dateFrom,
    string $dateTo
): void {
    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if ($dispatchId <= 0) {
        throw new RuntimeException('Invalid dispatch ID.');
    }

    if ($locationId <= 0) {
        throw new RuntimeException('Invalid location ID.');
    }

    if ($dateFrom === '' || $dateTo === '') {
        throw new RuntimeException('Date range is required.');
    }

    if ($dateFrom > $dateTo) {
        throw new RuntimeException('Invalid date range.');
    }

    $dispatch = getDispatchRecordById($connpcs, $dispatchId);

    if (!$dispatch) {
        throw new RuntimeException('Dispatch not found.');
    }

    $employeeId = (int)$dispatch['emp_number'];

    $range = [
        'start' => $dateFrom,
        'end' => $dateTo,
    ];

    if (hasDispatchOverlap($connpcs, $employeeId, $range, $dispatchId)) {
        throw new RuntimeException('Dispatch conflict.');
    }

    $sql = "
        UPDATE dispatch_list
        SET location_id = :locationId,
            dispatch_from = :dateFrom,
            dispatch_to = :dateTo
        WHERE dispatch_id = :dispatchId
    ";

    $stmt = $connpcs->prepare($sql);
    error_log("RUNNING UPDATE QUERY");
    $stmt->execute([
        ':locationId' => $locationId,
        ':dateFrom' => $dateFrom,
        ':dateTo' => $dateTo,
        ':dispatchId' => $dispatchId,
    ]);
}

function calculateOverlapDaysForYear(string $dateFrom, string $dateTo, int $year): int
{
    if (empty($dateFrom) || empty($dateTo) || $dateFrom > $dateTo) {
        return 0;
    }

    $yearStart = sprintf('%d-01-01', $year);
    $yearEnd = sprintf('%d-12-31', $year);

    $start = max($dateFrom, $yearStart);
    $end = min($dateTo, $yearEnd);

    if ($start > $end) {
        return 0;
    }

    $startDate = new DateTime($start);
    $endDate = new DateTime($end);

    return $startDate->diff($endDate)->days + 1;
}

function getDispatchRowsForYearWindow(PDO $connpcs, int $employeeId, string $startYear, string $endYear): array
{
    $sql = "
        SELECT dispatch_id, dispatch_from, dispatch_to
        FROM dispatch_list
        WHERE emp_number = :empID
          AND (
                (dispatch_from BETWEEN :startYear1 AND :endYear1)
                OR
                (dispatch_to BETWEEN :startYear2 AND :endYear2)
              )
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':empID' => $employeeId,
        ':startYear1' => $startYear,
        ':endYear1' => $endYear,
        ':startYear2' => $startYear,
        ':endYear2' => $endYear,
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getTotalDispatchDaysForYear(PDO $connpcs, int $employeeId, int $year): int
{
    $startYear = sprintf('%d-01-01', $year);
    $endYear = sprintf('%d-12-31', $year);

    $dispatchRows = getDispatchRowsForYearWindow($connpcs, $employeeId, $startYear, $endYear);

    $totalDays = 0;

    foreach ($dispatchRows as $row) {
        $totalDays += calculateOverlapDaysForYear(
            $row['dispatch_from'],
            $row['dispatch_to'],
            $year
        );
    }

    return $totalDays;
}

function getEmployeeYearlyDispatchTotals(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId
): array {
    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $yearNow = (int)date('Y');
    $yearPast = $yearNow - 1;
    $yearFuture = $yearNow + 1;

    return [
        (string)$yearPast => getTotalDispatchDaysForYear($connpcs, $employeeId, $yearPast),
        (string)$yearNow => getTotalDispatchDaysForYear($connpcs, $employeeId, $yearNow),
        (string)$yearFuture => getTotalDispatchDaysForYear($connpcs, $employeeId, $yearFuture),
    ];
}

function getAllLocations(PDO $connpcs): array
{
    $sql = "
        SELECT location_id AS id, location_name AS name
        FROM location_list
        ORDER BY location_name
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
    }

    return $rows;
}

function getEmployeeWorkHistory(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId
): array {
    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $sql = "
        SELECT
            work_hist_id AS id,
            MONTH(start_date) AS start_month,
            YEAR(start_date) AS start_year,
            MONTH(end_date) AS end_month,
            YEAR(end_date) AS end_year,
            comp_name,
            comp_business,
            business_cont,
            work_loc
        FROM work_history
        WHERE emp_id = :employeeId
        ORDER BY start_date DESC, work_hist_id DESC
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['start_month'] = $row['start_month'] !== null ? (int)$row['start_month'] : null;
        $row['start_year'] = $row['start_year'] !== null ? (int)$row['start_year'] : null;
        $row['end_month'] = $row['end_month'] !== null ? (int)$row['end_month'] : null;
        $row['end_year'] = $row['end_year'] !== null ? (int)$row['end_year'] : null;
    }

    return $rows;
}

function countEmployeeWorkHistory(PDO $connpcs, int $employeeId): int
{
    $sql = "
        SELECT COUNT(*)
        FROM work_history
        WHERE emp_id = :employeeId
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    return (int)$stmt->fetchColumn();
}

function insertEmployeeWorkHistory(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId,
    string $startMonthYear,
    string $endMonthYear,
    string $companyName,
    string $companyBusiness,
    string $businessContent,
    string $workLocation
): void {
    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if ($employeeId <= 0) {
        throw new RuntimeException('Employee number missing.');
    }

    if ($startMonthYear === '') {
        throw new RuntimeException('Start month and year missing.');
    }

    if ($companyName === '') {
        throw new RuntimeException('Company name missing.');
    }

    if ($companyBusiness === '') {
        throw new RuntimeException('Company business missing.');
    }

    if ($businessContent === '') {
        throw new RuntimeException('Business content missing.');
    }

    if ($workLocation === '') {
        throw new RuntimeException('Work location missing.');
    }

    $startDate = $startMonthYear . '-01';
    $endDate = null;

    if ($endMonthYear !== '') {
        $endDate = $endMonthYear . '-01';

        if ($endDate < $startDate) {
            throw new RuntimeException('Invalid date. End date must not be earlier than start date.');
        }
    }

    $entryCount = countEmployeeWorkHistory($connpcs, $employeeId);

    if ($entryCount > 2) {
        throw new RuntimeException('Work history full.');
    }

    $sql = "
        INSERT INTO work_history (
            emp_id,
            start_date,
            end_date,
            comp_name,
            comp_business,
            business_cont,
            work_loc
        ) VALUES (
            :employeeId,
            :startDate,
            :endDate,
            :companyName,
            :companyBusiness,
            :businessContent,
            :workLocation
        )
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
        ':startDate' => $startDate,
        ':endDate' => $endDate,
        ':companyName' => $companyName,
        ':companyBusiness' => $companyBusiness,
        ':businessContent' => $businessContent,
        ':workLocation' => $workLocation,
    ]);
}

function updateEmployeeWorkHistory(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $workHistId,
    string $startMonthYear,
    string $endMonthYear,
    string $companyName,
    string $companyBusiness,
    string $businessContent,
    string $workLocation
): void {

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if ($workHistId <= 0) {
        throw new RuntimeException('Invalid work history ID.');
    }

    if ($startMonthYear === '') {
        throw new RuntimeException('Start month and year missing.');
    }

    if ($companyName === '') {
        throw new RuntimeException('Company name missing.');
    }

    if ($companyBusiness === '') {
        throw new RuntimeException('Company business missing.');
    }

    if ($businessContent === '') {
        throw new RuntimeException('Business content missing.');
    }

    if ($workLocation === '') {
        throw new RuntimeException('Work location missing.');
    }

    $startDate = $startMonthYear . '-01';
    $endDate = null;

    if ($endMonthYear !== '') {
        $endDate = $endMonthYear . '-01';

        if ($endDate < $startDate) {
            throw new RuntimeException('Invalid date range.');
        }
    }

    $sql = "
        UPDATE work_history
        SET
            start_date = :startDate,
            end_date = :endDate,
            comp_name = :companyName,
            comp_business = :companyBusiness,
            business_cont = :businessContent,
            work_loc = :workLocation
        WHERE work_hist_id = :id
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':startDate' => $startDate,
        ':endDate' => $endDate,
        ':companyName' => $companyName,
        ':companyBusiness' => $companyBusiness,
        ':businessContent' => $businessContent,
        ':workLocation' => $workLocation,
        ':id' => $workHistId
    ]);
}

function deleteEmployeeWorkHistory(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $workHistId
): void {
    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if ($workHistId <= 0) {
        throw new RuntimeException('Invalid work history ID.');
    }

    $checkSql = "
        SELECT work_hist_id
        FROM work_history
        WHERE work_hist_id = :id
        LIMIT 1
    ";

    $checkStmt = $connpcs->prepare($checkSql);
    $checkStmt->execute([
        ':id' => $workHistId,
    ]);

    $row = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        throw new RuntimeException('Work history not found.');
    }

    $deleteSql = "
        DELETE FROM work_history
        WHERE work_hist_id = :id
    ";

    $deleteStmt = $connpcs->prepare($deleteSql);
    $deleteStmt->execute([
        ':id' => $workHistId,
    ]);
}

function updateEmployeePassport(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId,
    string $number,
    string $birthdate,
    string $issued,
    string $expiry,
    int $onProcess,
    array $files
): void {

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    $onProcess = $onProcess === 1 ? 1 : 0;

    // only require full fields when NOT on process
    if ($onProcess !== 1) {
        if ($number === '' || $birthdate === '' || $issued === '' || $expiry === '') {
            throw new RuntimeException('Complete all fields.');
        }

        if ($expiry < $issued) {
            throw new RuntimeException('Expiry must not be earlier than issue date.');
        }
    }

    // convert empty strings to null for DB
    $numberDb = ($number !== '') ? $number : null;
    $birthdateDb = ($birthdate !== '') ? $birthdate : null;
    $issuedDb = ($issued !== '') ? $issued : null;
    $expiryDb = ($expiry !== '') ? $expiry : null;

    $checkSql = "SELECT COUNT(*) FROM passport_details WHERE emp_number = :empID";
    $checkStmt = $connpcs->prepare($checkSql);
    $checkStmt->execute([':empID' => $employeeId]);
    $exists = (int)$checkStmt->fetchColumn();

    if ($exists === 0) {
        $sql = "
            INSERT INTO passport_details
            (
                emp_number,
                passport_birthdate,
                passport_number,
                passport_issue,
                passport_expiry,
                on_process
            )
            VALUES
            (
                :empID,
                :birthdate,
                :number,
                :issued,
                :expiry,
                :onProcess
            )
        ";
    } else {
        $sql = "
            UPDATE passport_details
            SET passport_birthdate = :birthdate,
                passport_number = :number,
                passport_issue = :issued,
                passport_expiry = :expiry,
                on_process = :onProcess
            WHERE emp_number = :empID
        ";
    }

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':empID' => $employeeId,
        ':birthdate' => $birthdateDb,
        ':number' => $numberDb,
        ':issued' => $issuedDb,
        ':expiry' => $expiryDb,
        ':onProcess' => $onProcess,
    ]);

    if (!empty($files['fileValue']['tmp_name'])) {
        $tmp = $files['fileValue']['tmp_name'];

        $folder = "C:/xampp/htdocs/PCS/empDetails/EmployeesFolder/" . $employeeId;

        if (!file_exists($folder)) {
            mkdir($folder, 0755, true);
        }

        $target = $folder . "/passport.pdf";

        if (file_exists($target)) {
            unlink($target);
        }

        if (!move_uploaded_file($tmp, $target)) {
            throw new RuntimeException('Failed to upload passport file.');
        }
    }
}

function updateEmployeeVisa(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId,
    string $number,
    string $issued,
    string $expiry,
    int $onProcess,
    array $files
): void {

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    $onProcess = $onProcess === 1 ? 1 : 0;

    if ($onProcess !== 1) {
        if ($number === '' || $issued === '' || $expiry === '') {
            throw new RuntimeException('Complete all fields.');
        }

        if ($expiry < $issued) {
            throw new RuntimeException('End date must not be earlier than start date.');
        }
    }

    $numberDb = ($number !== '') ? $number : null;
    $issuedDb = ($issued !== '') ? $issued : null;
    $expiryDb = ($expiry !== '') ? $expiry : null;

    $checkSql = "SELECT COUNT(*) FROM visa_details WHERE emp_number = :empID";
    $checkStmt = $connpcs->prepare($checkSql);
    $checkStmt->execute([':empID' => $employeeId]);
    $exists = (int)$checkStmt->fetchColumn();

    if ($exists === 0) {
        $sql = "
            INSERT INTO visa_details
            (
                emp_number,
                visa_number,
                visa_issue,
                visa_expiry,
                on_process
            )
            VALUES
            (
                :empID,
                :number,
                :issued,
                :expiry,
                :onProcess
            )
        ";
    } else {
        $sql = "
            UPDATE visa_details
            SET visa_number = :number,
                visa_issue = :issued,
                visa_expiry = :expiry,
                on_process = :onProcess
            WHERE emp_number = :empID
        ";
    }

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':empID' => $employeeId,
        ':number' => $numberDb,
        ':issued' => $issuedDb,
        ':expiry' => $expiryDb,
        ':onProcess' => $onProcess,
    ]);

    if (!empty($files['fileValue']['tmp_name'])) {
        $tmp = $files['fileValue']['tmp_name'];

        $folder = "C:/xampp/htdocs/PCS/empDetails/EmployeesFolder/" . $employeeId;

        if (!file_exists($folder)) {
            mkdir($folder, 0755, true);
        }

        $target = $folder . "/visa.pdf";

        if (file_exists($target)) {
            unlink($target);
        }

        if (!move_uploaded_file($tmp, $target)) {
            throw new RuntimeException('Failed to upload visa file.');
        }
    }
}

function getEmployeeReentryPermit(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId,
    bool $isDetails
): array {

    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $accessibleMemberIds = getMemberIdsForEmployee($connnew, $connkdt, $viewerEmployeeNumber);

    if (!in_array((string)$employeeId, $accessibleMemberIds, true)) {
        throw new RuntimeException('Access denied.');
    }

    $sql = "
        SELECT
            permit_expiry AS expiry,
            on_process
        FROM reentry_permit_details
        WHERE emp_number = :employeeId
        LIMIT 1
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    $permit = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$permit) {
        return [];
    }

    $status = 'invalid';

    if ((int)$permit['on_process'] === 1) {
        $status = 'on_process';
    } elseif (!empty($permit['expiry'])) {
        $expiryTs = strtotime($permit['expiry']);
        $todayTs = strtotime(date('Y-m-d'));

        if ($expiryTs >= $todayTs) {
            $warningMonths = envInt('REENTRY_PERMIT_EXPIRY_WARNING_MONTHS', 6);
            if ($warningMonths < 1) $warningMonths = 6;

            $warningCutoff = strtotime('+' . $warningMonths . ' months');

            $status = ($expiryTs <= $warningCutoff)
                ? 'valid_expiring'
                : 'valid';
        }
    }

    if ($isDetails && !empty($permit['expiry'])) {
        $permit['expiry'] = date('d M Y', strtotime($permit['expiry']));
    }

    $permit['reentryPermitLink'] = getReentryPermitFileLink($employeeId);
    $permit['status'] = $status;
    $permit['on_process'] = (int)$permit['on_process'];

    return $permit;
}

function getReentryPermitFileLink(int $employeeId): string
{
    $relativePath = "./EmployeesFolder/" . $employeeId . "/reentry_permit.pdf";
    $absolutePath = "C:/xampp/htdocs/PCS/empDetails/EmployeesFolder/" . $employeeId . "/reentry_permit.pdf";

    if (!file_exists($absolutePath)) {
        return '';
    }

    return $relativePath . '?version=' . date('YmdHis');
}

function updateEmployeeReentryPermit(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $viewerEmployeeNumber,
    int $employeeId,
    string $expiry,
    int $onProcess,
    array $files
): void {

    if (!hasPermission($connkdt, $viewerEmployeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    if ($employeeId <= 0) {
        throw new RuntimeException('Invalid employee ID.');
    }

    $onProcess = $onProcess === 1 ? 1 : 0;

    // validation
    if ($onProcess !== 1 && $expiry === '') {
        throw new RuntimeException('Expiry date is required.');
    }

    $expiryDb = ($expiry !== '') ? $expiry : null;

    // check if record exists
    $checkSql = "SELECT COUNT(*) FROM reentry_permit_details WHERE emp_number = :empID";
    $checkStmt = $connpcs->prepare($checkSql);
    $checkStmt->execute([':empID' => $employeeId]);
    $exists = (int)$checkStmt->fetchColumn();

    if ($exists === 0) {
        $sql = "
            INSERT INTO reentry_permit_details
            (emp_number, permit_expiry, on_process)
            VALUES (:empID, :expiry, :onProcess)
        ";
    } else {
        $sql = "
            UPDATE reentry_permit_details
            SET permit_expiry = :expiry,
                on_process = :onProcess
            WHERE emp_number = :empID
        ";
    }

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':empID' => $employeeId,
        ':expiry' => $expiryDb,
        ':onProcess' => $onProcess,
    ]);

    // file upload
    if (!empty($files['fileValue']['tmp_name'])) {
        $tmp = $files['fileValue']['tmp_name'];

        $folder = "C:/xampp/htdocs/PCS/empDetails/EmployeesFolder/" . $employeeId;

        if (!file_exists($folder)) {
            mkdir($folder, 0755, true);
        }

        $target = $folder . "/reentry_permit.pdf";

        if (file_exists($target)) {
            unlink($target);
        }

        if (!move_uploaded_file($tmp, $target)) {
            throw new RuntimeException('Failed to upload re-entry permit file.');
        }
    }
}