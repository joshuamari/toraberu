<?php

function getRequestListMemberIds(PDO $connnew, PDO $connkdt, string $employeeNumber): array
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

function getEmployeeDisplayName(PDO $connnew, PDO $connpcs, int $id): string
{
    $sqlNew = "SELECT CONCAT(surname, ', ', firstname) AS full_name FROM employee_list WHERE id = :id LIMIT 1";
    $stmtNew = $connnew->prepare($sqlNew);
    $stmtNew->execute([':id' => $id]);
    $name = $stmtNew->fetchColumn();

    if ($name) {
        return ucwords(strtolower((string)$name));
    }

    $sqlPcs = "SELECT CONCAT(surname, ', ', firstname) AS full_name FROM khi_details WHERE number = :id LIMIT 1";
    $stmtPcs = $connpcs->prepare($sqlPcs);
    $stmtPcs->execute([':id' => $id]);
    $name = $stmtPcs->fetchColumn();

    return $name ? ucwords(strtolower((string)$name)) : '';
}

function countInclusiveDays(string $from, string $to): int
{
    $date1 = date_create($from);
    $date2 = date_create($to);
    $diff = date_diff($date1, $date2);

    return (int)$diff->format('%a') + 1;
}

function formatActivityTimestamp(?string $datetime): string
{
    $raw = trim((string)$datetime);
    if ($raw === '') {
        return '';
    }

    $ts = strtotime($raw);
    if ($ts === false) {
        return '';
    }

    return date('Y-m-d\TH:i:s', $ts) . '+08:00';
}

function formatActivityDisplayDate(?string $date): string
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

function formatChangeRequestDisplayId(string $changeType, int $changeRequestId, string $requestedAt): string
{
    $year = date('Y', strtotime($requestedAt) ?: time());
    $paddedId = str_pad((string)$changeRequestId, 3, '0', STR_PAD_LEFT);
    $prefix = $changeType === 'cancellation' ? 'CR' : 'DCR';

    return "{$prefix}-{$year}-{$paddedId}";
}

function normalizeChangeRequestStatus(?string $status): string
{
    $normalized = strtolower(trim((string)$status));

    return match ($normalized) {
        'approved', 'accepted' => 'approved',
        'declined', 'rejected', 'denied' => 'declined',
        'withdrawn' => 'withdrawn',
        'pending' => 'pending',
        default => $normalized !== '' ? $normalized : 'pending',
    };
}

/**
 * Prefer request_list.date_modified, but if that timestamp matches a change-request
 * decision it was overwritten — fall back to the earliest change request time.
 *
 * @param array<int, array<string, mixed>> $changeRows
 */
function resolveDispatchApprovalTimestamp(
    ?string $dateRequested,
    ?string $dateModified,
    array $changeRows
): string {
    $submittedAt = formatActivityTimestamp($dateRequested);
    $modifiedAt = formatActivityTimestamp($dateModified);
    $changeDecisionTimes = [];
    $earliestChangeRequestedAt = '';

    foreach ($changeRows as $change) {
        $requestedAt = formatActivityTimestamp($change['requested_at'] ?? null);
        $decisionAt = formatActivityTimestamp($change['date_modified'] ?? null);

        if ($requestedAt !== '' && ($earliestChangeRequestedAt === '' || $requestedAt < $earliestChangeRequestedAt)) {
            $earliestChangeRequestedAt = $requestedAt;
        }

        if ($decisionAt !== '') {
            $changeDecisionTimes[] = $decisionAt;
        }
    }

    if ($modifiedAt !== '' && in_array($modifiedAt, $changeDecisionTimes, true)) {
        if ($earliestChangeRequestedAt !== '') {
            return $earliestChangeRequestedAt;
        }

        if ($submittedAt !== '') {
            return $submittedAt;
        }
    }

    if ($modifiedAt !== '') {
        return $modifiedAt;
    }

    return $submittedAt;
}

function getActivityEventSortOrder(string $eventType): int
{
    $order = [
        'dispatch_submitted' => 10,
        'dispatch_approved' => 20,
        'dispatch_declined' => 20,
        'date_change_requested' => 30,
        'date_change_accepted' => 40,
        'date_change_rejected' => 40,
        'cancellation_requested' => 50,
        'cancellation_accepted' => 60,
        'cancellation_rejected' => 60,
        'dispatch_cancelled' => 70,
        'dispatch_completed' => 80,
    ];

    return $order[$eventType] ?? 100;
}

/**
 * @param array<int, array<string, mixed>> $events
 * @return array<int, array<string, mixed>>
 */
function sortRequestActivityLog(array $events): array
{
    usort($events, static function (array $a, array $b): int {
        $timeA = (string)($a['occurredAt'] ?? '');
        $timeB = (string)($b['occurredAt'] ?? '');

        if ($timeA !== $timeB) {
            return $timeA <=> $timeB;
        }

        return getActivityEventSortOrder((string)($a['eventType'] ?? ''))
            <=> getActivityEventSortOrder((string)($b['eventType'] ?? ''));
    });

    return array_values($events);
}

function resolveApproverDisplayName(PDO $connnew): string
{
    $president = getPresidentDisplayData($connnew);
    $name = trim((string)($president['name'] ?? ''));

    if ($name !== '') {
        $prefix = trim((string)($president['prefix'] ?? ''));
        return $prefix !== '' ? trim($prefix . ' ' . $name) : $name;
    }

    return 'KDT President';
}

/**
 * @param array<int, array<string, mixed>> $changeRows
 * @return array<int, array<string, mixed>>
 */
function buildRequestActivityLog(
    int $requestId,
    ?string $dateRequested,
    $requestStatus,
    ?string $dateModified,
    string $requesterName,
    array $changeRows,
    string $approverName
): array {
    $events = [];
    $hasApprovedCancellation = false;

    $submittedAt = formatActivityTimestamp($dateRequested);
    if ($submittedAt !== '') {
        $events[] = [
            'activityId' => "ACT-{$requestId}-submitted",
            'eventType' => 'dispatch_submitted',
            'occurredAt' => $submittedAt,
            'actorName' => $requesterName,
            'description' => 'The dispatch request was submitted.',
        ];
    }

    foreach ($changeRows as $change) {
        $changeType = strtolower(trim((string)($change['change_type'] ?? '')));
        $changeStatus = normalizeChangeRequestStatus($change['status'] ?? null);
        $changeRequestId = (int)($change['change_request_id'] ?? 0);
        $requestedAtRaw = (string)($change['requested_at'] ?? '');
        $decisionAtRaw = (string)($change['date_modified'] ?? '');
        $requestedByName = trim((string)($change['requested_by_name'] ?? ''));
        $displayId = formatChangeRequestDisplayId(
            $changeType,
            $changeRequestId,
            $requestedAtRaw
        );
        $requestedAt = formatActivityTimestamp($requestedAtRaw);
        $decisionAt = formatActivityTimestamp($decisionAtRaw);

        if ($changeType === 'date_change') {
            $originalStart = formatActivityDisplayDate($change['original_start_date'] ?? null);
            $originalEnd = formatActivityDisplayDate($change['original_end_date'] ?? null);
            $requestedStart = formatActivityDisplayDate($change['requested_start_date'] ?? null);
            $requestedEnd = formatActivityDisplayDate($change['requested_end_date'] ?? null);
            $periodText = '';
            if ($originalStart !== '' && $originalEnd !== '' && $requestedStart !== '' && $requestedEnd !== '') {
                $periodText = " from {$originalStart} – {$originalEnd} to {$requestedStart} – {$requestedEnd}";
            }

            $requestDescription = "A date-change request was submitted{$periodText}.";
            if ($changeStatus === 'withdrawn') {
                $requestDescription = "A date-change request was submitted{$periodText} (later withdrawn).";
            }

            if ($requestedAt !== '') {
                $events[] = [
                    'activityId' => "ACT-{$requestId}-dcr-{$changeRequestId}-requested",
                    'eventType' => 'date_change_requested',
                    'occurredAt' => $requestedAt,
                    'actorName' => $requestedByName,
                    'description' => $requestDescription,
                    'changeRequestType' => 'date_change',
                    'changeRequestId' => (string)$changeRequestId,
                    'changeRequestReference' => $displayId,
                ];
            }

            if ($changeStatus === 'approved' && $decisionAt !== '') {
                $events[] = [
                    'activityId' => "ACT-{$requestId}-dcr-{$changeRequestId}-accepted",
                    'eventType' => 'date_change_accepted',
                    'occurredAt' => $decisionAt,
                    'actorName' => $approverName,
                    'description' => 'The proposed dispatch dates were accepted.',
                    'changeRequestType' => 'date_change',
                    'changeRequestId' => (string)$changeRequestId,
                    'changeRequestReference' => $displayId,
                ];
            } elseif ($changeStatus === 'declined' && $decisionAt !== '') {
                $events[] = [
                    'activityId' => "ACT-{$requestId}-dcr-{$changeRequestId}-rejected",
                    'eventType' => 'date_change_rejected',
                    'occurredAt' => $decisionAt,
                    'actorName' => $approverName,
                    'description' => 'The proposed dispatch dates were rejected.',
                    'changeRequestType' => 'date_change',
                    'changeRequestId' => (string)$changeRequestId,
                    'changeRequestReference' => $displayId,
                ];
            }

            continue;
        }

        if ($changeType === 'cancellation') {
            $requestDescription = 'A cancellation request was submitted.';
            if ($changeStatus === 'withdrawn') {
                $requestDescription = 'A cancellation request was submitted (later withdrawn).';
            }

            if ($requestedAt !== '') {
                $events[] = [
                    'activityId' => "ACT-{$requestId}-cr-{$changeRequestId}-requested",
                    'eventType' => 'cancellation_requested',
                    'occurredAt' => $requestedAt,
                    'actorName' => $requestedByName,
                    'description' => $requestDescription,
                    'changeRequestType' => 'cancellation',
                    'changeRequestId' => (string)$changeRequestId,
                    'changeRequestReference' => $displayId,
                ];
            }

            if ($changeStatus === 'approved' && $decisionAt !== '') {
                $hasApprovedCancellation = true;
                $events[] = [
                    'activityId' => "ACT-{$requestId}-cr-{$changeRequestId}-accepted",
                    'eventType' => 'cancellation_accepted',
                    'occurredAt' => $decisionAt,
                    'actorName' => $approverName,
                    'description' => 'The cancellation request was accepted.',
                    'changeRequestType' => 'cancellation',
                    'changeRequestId' => (string)$changeRequestId,
                    'changeRequestReference' => $displayId,
                ];
                $events[] = [
                    'activityId' => "ACT-{$requestId}-cancelled-{$changeRequestId}",
                    'eventType' => 'dispatch_cancelled',
                    'occurredAt' => $decisionAt,
                    'actorName' => $approverName,
                    'description' => 'The dispatch request was cancelled.',
                ];
            } elseif ($changeStatus === 'declined' && $decisionAt !== '') {
                $events[] = [
                    'activityId' => "ACT-{$requestId}-cr-{$changeRequestId}-rejected",
                    'eventType' => 'cancellation_rejected',
                    'occurredAt' => $decisionAt,
                    'actorName' => $approverName,
                    'description' => 'The cancellation request was rejected.',
                    'changeRequestType' => 'cancellation',
                    'changeRequestId' => (string)$changeRequestId,
                    'changeRequestReference' => $displayId,
                ];
            }
        }
    }

    $approvalAt = resolveDispatchApprovalTimestamp(
        $dateRequested,
        $dateModified,
        $changeRows
    );
    $decisionAt = formatActivityTimestamp($dateModified);
    if ($decisionAt === '') {
        $decisionAt = $submittedAt;
    }

    if ($requestStatus === null || $requestStatus === '') {
        // Pending — submission (+ any change events) only.
    } elseif ((int)$requestStatus === 1) {
        if ($approvalAt !== '') {
            $events[] = [
                'activityId' => "ACT-{$requestId}-approved",
                'eventType' => 'dispatch_approved',
                'occurredAt' => $approvalAt,
                'actorName' => $approverName,
                'description' => 'The dispatch request was approved.',
            ];
        }
    } elseif ((int)$requestStatus === 0) {
        if ($hasApprovedCancellation) {
            if ($approvalAt !== '') {
                $events[] = [
                    'activityId' => "ACT-{$requestId}-approved",
                    'eventType' => 'dispatch_approved',
                    'occurredAt' => $approvalAt,
                    'actorName' => $approverName,
                    'description' => 'The dispatch request was approved.',
                ];
            }
        } elseif ($decisionAt !== '') {
            $events[] = [
                'activityId' => "ACT-{$requestId}-declined",
                'eventType' => 'dispatch_declined',
                'occurredAt' => $decisionAt,
                'actorName' => $approverName,
                'description' => 'The dispatch request was declined.',
            ];
        }
    }

    return sortRequestActivityLog($events);
}

/**
 * @param array<int> $requestIds
 * @return array<int, array<int, array<string, mixed>>>
 */
function fetchChangeRequestsByRequestId(PDO $connpcs, PDO $connnew, array $requestIds): array
{
    $grouped = [];
    if (count($requestIds) === 0) {
        return $grouped;
    }

    $placeholders = implode(',', array_fill(0, count($requestIds), '?'));
    $changeQ = "
        SELECT
            rcl.change_request_id,
            rcl.request_id,
            rcl.change_type,
            rcl.status,
            rcl.original_start_date,
            rcl.original_end_date,
            rcl.requested_start_date,
            rcl.requested_end_date,
            rcl.reason,
            rcl.requested_by,
            rcl.requested_at,
            rcl.date_modified
        FROM pcosdb.request_change_list rcl
        WHERE rcl.request_id IN ({$placeholders})
        ORDER BY rcl.requested_at ASC, rcl.change_request_id ASC
    ";
    $changeStmt = $connpcs->prepare($changeQ);
    $changeStmt->execute(array_values($requestIds));
    $rows = $changeStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $row) {
        $requestId = (int)$row['request_id'];
        $row['requested_by_name'] = getEmployeeDisplayName(
            $connnew,
            $connpcs,
            (int)$row['requested_by']
        );
        $grouped[$requestId][] = $row;
    }

    return $grouped;
}

/**
 * @param array<int, array<string, mixed>> $changeRows
 * @return array{pending_date_change_request: bool, pending_cancellation_request: bool, has_approved_cancellation: bool}
 */
function summarizeChangeRequestFlags(array $changeRows): array
{
    $flags = [
        'pending_date_change_request' => false,
        'pending_cancellation_request' => false,
        'has_approved_cancellation' => false,
    ];

    foreach ($changeRows as $change) {
        $changeType = strtolower(trim((string)($change['change_type'] ?? '')));
        $changeStatus = normalizeChangeRequestStatus($change['status'] ?? null);

        if ($changeType === 'date_change' && $changeStatus === 'pending') {
            $flags['pending_date_change_request'] = true;
        }

        if ($changeType === 'cancellation' && $changeStatus === 'pending') {
            $flags['pending_cancellation_request'] = true;
        }

        if ($changeType === 'cancellation' && $changeStatus === 'approved') {
            $flags['has_approved_cancellation'] = true;
        }
    }

    return $flags;
}

function getRequestDetails(PDO $connpcs, PDO $connnew, int $requestId): ?array
{
    $sql = "SELECT * FROM request_list WHERE request_id = :request_id LIMIT 1";
    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':request_id' => $requestId,
    ]);

    $details = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$details) {
        return null;
    }

    $groupSql = "SELECT group_id FROM employee_list WHERE id = :id LIMIT 1";
    $groupStmt = $connnew->prepare($groupSql);
    $groupStmt->execute([
        ':id' => $details['emp_number'],
    ]);

    $details['emp_group'] = (int)($groupStmt->fetchColumn() ?: 0);

    return $details;
}

function getDispatchID(PDO $connpcs, int $requestId): ?int
{
    $sql = "SELECT dispatch_id FROM dispatch_list WHERE request_id = :request_id LIMIT 1";
    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':request_id' => $requestId,
    ]);

    $dispatchId = $stmt->fetchColumn();

    return $dispatchId !== false ? (int)$dispatchId : null;
}

function getRequestList(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    if (!hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION)) {
        throw new RuntimeException('Not authorized.');
    }

    $memberIds = getRequestListMemberIds($connnew, $connkdt, $employeeNumber);

    if (empty($memberIds)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($memberIds), '?'));

    $sql = "
        SELECT
            rl.request_id,
            rl.emp_number,
            rl.requester_id,
            gll.name AS requester_group,
            rl.dispatch_from,
            rl.dispatch_to,
            rl.date_requested,
            rl.location_id,
            ll.location_name,
            rl.specific_loc,
            el.group_id,
            gl.name,
            pd.passport_expiry,
            vd.visa_expiry,
            rd.emp_number AS reentry_emp_id,
            rd.permit_expiry,
            rd.on_process AS reentry_on_process,
            rl.request_status,
            rl.date_modified
        FROM pcosdb.request_list rl
        JOIN kdtphdb_new.employee_list el
            ON rl.emp_number = el.id
        LEFT JOIN passport_details pd
            ON pd.emp_number = el.id
        LEFT JOIN kdtphdb_new.group_list gl
            ON el.group_id = gl.id
        LEFT JOIN pcosdb.khi_details kd
            ON kd.number = rl.requester_id
        LEFT JOIN kdtphdb_new.group_list gll
            ON kd.group_id = gll.id
        LEFT JOIN pcosdb.location_list ll
            ON rl.location_id = ll.location_id
        LEFT JOIN visa_details vd
            ON vd.emp_number = el.id
        LEFT JOIN reentry_permit_details rd
            ON rd.emp_number = el.id
        WHERE rl.emp_number != 0
          AND rl.emp_number IN ($placeholders)
        ORDER BY rl.date_requested DESC
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute($memberIds);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $result = [];

    $requestIds = array_map(static function (array $row): int {
        return (int)$row['request_id'];
    }, $rows);
    $changesByRequestId = fetchChangeRequestsByRequestId($connpcs, $connnew, $requestIds);
    $approverName = resolveApproverDisplayName($connnew);

    foreach ($rows as $row) {
        $to = $row['dispatch_to'];
        $passExp = $row['passport_expiry'];
        $visaExp = $row['visa_expiry'];

        $passValidity = $passExp && strtotime($passExp) >= strtotime($to);
        $visaValidity = $visaExp && strtotime($visaExp) >= strtotime($to);
        $reentryStatus = resolveReentryPermitStatus(
            $row['reentry_emp_id'] !== null && $row['reentry_emp_id'] !== '',
            $row['reentry_on_process'] ?? 0,
            $row['permit_expiry'] ?? null
        );

        $requestId = (int)$row['request_id'];
        $empNumber = (int)$row['emp_number'];
        $requesterId = (int)$row['requester_id'];
        $requesterName = getEmployeeDisplayName($connnew, $connpcs, $requesterId);
        $changeRows = $changesByRequestId[$requestId] ?? [];
        $changeFlags = summarizeChangeRequestFlags($changeRows);

        $result[] = array_merge([
            'req_id' => $requestId,
            'emp_name' => getEmployeeDisplayName($connnew, $connpcs, $empNumber),
            'emp_number' => $empNumber,
            'group_id' => (int)$row['group_id'],
            'specific_loc' => $row['specific_loc'],
            'location' => $row['location_name'],
            'location_id' => (int)$row['location_id'],
            'group_name' => $row['name'],
            'requester_name' => $requesterName,
            'requester_group' => $row['requester_group'],
            'from' => $row['dispatch_from'],
            'to' => $to,
            'duration' => countInclusiveDays($row['dispatch_from'], $to),
            'req_date' => date('Y-m-d', strtotime($row['date_requested'])),
            'passValid' => (bool)$passValidity,
            'visaValid' => (bool)$visaValidity,
            'reentryStatus' => $reentryStatus,
            'status' => $row['request_status'],
            'modified' => $row['date_modified'],
            'activityLog' => buildRequestActivityLog(
                $requestId,
                $row['date_requested'] ?? null,
                $row['request_status'],
                $row['date_modified'] ?? null,
                $requesterName,
                $changeRows,
                $approverName
            ),
        ], $changeFlags);
    }

    return $result;
}

function getRequestCounts(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    if (!hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION)) {
        throw new RuntimeException('Not authorized.');
    }

    $memberIds = getRequestListMemberIds($connnew, $connkdt, $employeeNumber);

    if (empty($memberIds)) {
        return [
            'pending' => 0,
            'accepted' => 0,
            'cancelled' => 0,
            'todaytotal' => 0,
            'todayaccept' => 0,
            'total' => 0,
        ];
    }

    $placeholders = implode(',', array_fill(0, count($memberIds), '?'));

    $sql = "
        SELECT
            COUNT(CASE WHEN request_status IS NULL THEN 1 END) AS pending,
            COUNT(CASE WHEN request_status = 1 THEN 1 END) AS accepted,
            COUNT(CASE WHEN request_status = 0 THEN 1 END) AS cancelled,
            COUNT(CASE WHEN DATE(date_requested) = CURDATE() THEN 1 END) AS todaytotal,
            COUNT(CASE WHEN request_status = 1 AND DATE(date_modified) = CURDATE() THEN 1 END) AS todayaccept,
            COUNT(*) AS total
        FROM request_list
        WHERE emp_number IN ($placeholders)
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute($memberIds);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return [
            'pending' => 0,
            'accepted' => 0,
            'cancelled' => 0,
            'todaytotal' => 0,
            'todayaccept' => 0,
            'total' => 0,
        ];
    }

    return [
        'pending' => (int)$row['pending'],
        'accepted' => (int)$row['accepted'],
        'cancelled' => (int)$row['cancelled'],
        'todaytotal' => (int)$row['todaytotal'],
        'todayaccept' => (int)$row['todayaccept'],
        'total' => (int)$row['total'],
    ];
}

function getLocationNameById(PDO $connpcs, int $locationId): string
{
    $sql = "SELECT location_name FROM location_list WHERE location_id = :location_id LIMIT 1";
    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':location_id' => $locationId,
    ]);

    return (string)($stmt->fetchColumn() ?: '');
}

function getAllowanceByEmployee(PDO $connpcs, int $employeeId): array
{
    $sql = "
        SELECT location_id, amount
        FROM allowance_list
        WHERE level_id = IFNULL(
            (
                SELECT da.level_id
                FROM pcosdb.designation_allowance da
                JOIN kdtphdb_new.employee_list el
                    ON da.designation_id = el.designation
                WHERE el.id = :employee_id
                LIMIT 1
            ),
            1
        )
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employee_id' => $employeeId,
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getCompanyIdByDepartment(PDO $connpcs, int $deptId): int
{
    $sql = "SELECT comp_id FROM requesters_dep WHERE id = :dept_id LIMIT 1";
    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':dept_id' => $deptId,
    ]);

    return (int)($stmt->fetchColumn() ?: 0);
}

function getCompanyDetailsById(PDO $connpcs, int $companyId): array
{
    $default = [
        'company_name' => '',
        'company_jap' => '',
        'company_desc' => '',
        'company_loc' => '',
    ];

    if ($companyId <= 0) {
        return $default;
    }

    $sql = "SELECT * FROM company_list WHERE id = :company_id LIMIT 1";
    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':company_id' => $companyId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: $default;
}

function getWorkHistoryByEmployee(PDO $connpcs, int $employeeId): array
{
    $sql = "
        SELECT *
        FROM work_history
        WHERE emp_id = :employee_id
        ORDER BY start_date
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':employee_id' => $employeeId,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $history = [];

    foreach ($rows as $row) {
        $history[] = [
            'company_name' => $row['comp_name'],
            'company_business' => $row['comp_business'],
            'business_content' => $row['business_cont'],
            'location' => $row['work_loc'],
            'start_year' => date('Y', strtotime($row['start_date'])),
            'start_month' => date('n', strtotime($row['start_date'])),
            'end_year' => !empty($row['end_date']) ? date('Y', strtotime($row['end_date'])) : null,
            'end_month' => !empty($row['end_date']) ? date('n', strtotime($row['end_date'])) : null,
        ];
    }

    return $history;
}

function getRequestDataById(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber, int $requestId): array
{
    if ($requestId <= 0) {
        throw new RuntimeException('Invalid request ID.');
    }

    if (!hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION)) {
        throw new RuntimeException('Not authorized.');
    }

    $sql = "
        SELECT
            rl.*,
            rd.department_name
        FROM request_list rl
        JOIN requesters_dep rd
            ON rl.dept_id = rd.id
        WHERE rl.request_id = :request_id
        LIMIT 1
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute([
        ':request_id' => $requestId,
    ]);

    $details = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$details) {
        throw new RuntimeException('Request not found.');
    }

    $memberIds = getRequestListMemberIds($connnew, $connkdt, $employeeNumber);
    $empNumber = (int)$details['emp_number'];

    if (!in_array((string)$empNumber, $memberIds, true)) {
        throw new RuntimeException('Not authorized.');
    }

    $details['emp_name'] = getEmployeeDisplayName($connnew, $connpcs, $empNumber);
    $details['request_dept'] = $details['department_name'];
    $details['start'] = date('d M Y', strtotime($details['dispatch_from']));
    $details['end'] = date('d M Y', strtotime($details['dispatch_to']));
    $details['date_request'] = date('d M Y', strtotime($details['date_requested']));
    $details['dh_date'] = date('F d, Y', strtotime($details['date_requested']));
    $details['location'] = getLocationNameById($connpcs, (int)$details['location_id']);
    $details['location_id'] = (int)$details['location_id'];
    $details['invitation_id'] = (int)$details['invitation_id'];
    $details['site_dispatch'] = (int)$details['site_dispatch'];
    $details['allowance'] = getAllowanceByEmployee($connpcs, $empNumber);
    $details['business'] = $details['work_content'];
    $details['gap_name'] = $details['gap_name'];
    $details['cdcp_name'] = $details['cdcp_name'];
    $details['gap_tel'] = $details['gap_tel'];
    $details['cdcp_tel'] = $details['cdcp_tel'];
    $details['dic_tel'] = '℡ ' . $details['dic_tel'];

    $companyId = getCompanyIdByDepartment($connpcs, (int)$details['dept_id']);
    $companyDetails = getCompanyDetailsById($connpcs, $companyId);

    $details['company_name'] = $companyDetails['company_name'] ?? '';
    $details['company_jap'] = $companyDetails['company_jap'] ?? '';
    $details['company_desc'] = $companyDetails['company_desc'] ?? '';
    $details['company_loc'] = $companyDetails['company_loc'] ?? '';

    return [
        'dispatch_request' => $details,
        'work_history' => getWorkHistoryByEmployee($connpcs, $empNumber),
    ];
}

function getPresidentIds(PDO $connnew): array
{
    $overrideEnabled = envBool('REQUESTLIST_PRES_OVERRIDE_ENABLED', false);

    if ($overrideEnabled) {
        return envCsvIntArray('REQUESTLIST_PRES_OVERRIDE_IDS');
    }

    $sql = "
        SELECT id
        FROM employee_list
        WHERE designation = 29
          AND (
                resignation_date IS NULL
                OR resignation_date = '0000-00-00'
                OR resignation_date > CURDATE()
              )
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute();

    return array_map('intval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'id'));
}

function getRequestApprovalAllowedIds(PDO $connnew): array
{
    $presidentIds = getPresidentIds($connnew);

    if (!envBool('REQUEST_APPROVAL_OVERRIDE_ENABLED', false)) {
        return $presidentIds;
    }

    $overrideIds = envCsvIntArray('REQUEST_APPROVAL_OVERRIDE_IDS');

    return array_values(array_unique(array_merge($presidentIds, $overrideIds)));
}

function canUpdateRequestStatus(PDO $connnew, string $employeeNumber): bool
{
    $allowedIds = getRequestApprovalAllowedIds($connnew);

    return in_array((int)$employeeNumber, $allowedIds, true);
}

function updateRequestStatus(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $employeeNumber,
    int $requestId,
    ?int $status
): void {
    if (!hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION)) {
        throw new RuntimeException('Not authorized.');
    }

    if (!canUpdateRequestStatus($connnew, $employeeNumber)) {
        throw new RuntimeException('Not authorized to update request status.');
    }

    $memberIds = getRequestListMemberIds($connnew, $connkdt, $employeeNumber);

    $details = getRequestDetails($connpcs, $connnew, $requestId);

    if (!$details) {
        throw new RuntimeException('Request not found.');
    }

    if (!in_array((string)$details['emp_number'], $memberIds, true)) {
        throw new RuntimeException('Not authorized.');
    }

    if ($status !== 0 && $status !== 1) {
        throw new RuntimeException('Invalid request status.');
    }

    $dispatchID = getDispatchID($connpcs, $requestId);
    $currentDatetime = date('Y-m-d H:i:s');

    $connpcs->beginTransaction();

    try {
        $updateQ = "
            UPDATE request_list
            SET request_status = :status,
                date_modified = :modified
            WHERE request_id = :request_id
        ";

        $stmt = $connpcs->prepare($updateQ);
        $stmt->execute([
            ':status' => $status,
            ':modified' => $currentDatetime,
            ':request_id' => $requestId,
        ]);

        if ($status === 1 && $dispatchID === null) {
            $insertQ = "
                INSERT INTO dispatch_list (
                    emp_number, location_id, dispatch_from, dispatch_to, request_id
                ) VALUES (
                    :emp_number, :location_id, :dispatch_from, :dispatch_to, :request_id
                )
            ";

            $insertStmt = $connpcs->prepare($insertQ);
            $insertStmt->execute([
                ':emp_number' => $details['emp_number'],
                ':location_id' => $details['location_id'],
                ':dispatch_from' => $details['dispatch_from'],
                ':dispatch_to' => $details['dispatch_to'],
                ':request_id' => $requestId,
            ]);
        }

        if ($dispatchID !== null && $status !== 1) {
            $deleteQ = "DELETE FROM dispatch_list WHERE dispatch_id = :dispatch_id";
            $deleteStmt = $connpcs->prepare($deleteQ);
            $deleteStmt->execute([
                ':dispatch_id' => $dispatchID,
            ]);
        }

        $connpcs->commit();
    } catch (Throwable $e) {
        $connpcs->rollBack();
        throw $e;
    }

try {
    sendRequestStatusChangeEmail($connpcs, $connnew, (int)$status, $details);
} catch (Throwable $e) {
    error_log('Email failed: ' . $e->getMessage());
}
}

function getRequestListGroups(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    if (!hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION)) {
        throw new RuntimeException('Not authorized.');
    }

    $hasAllGroupAccess = hasPermission($connkdt, $employeeNumber, PCS_ALL_GROUP_PERMISSION);

    if ($hasAllGroupAccess) {
        $sql = "
            SELECT
                gl.id,
                gl.name,
                gl.abbreviation,
                (
                    SELECT COUNT(*)
                    FROM kdtphdb_new.employee_group eg
                    WHERE eg.group_id = gl.id
                ) AS empCount
            FROM kdtphdb_new.group_list gl
            HAVING empCount > 0
            ORDER BY gl.name
        ";

        $stmt = $connpcs->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $sql = "
        SELECT
            gl.id,
            gl.name,
            gl.abbreviation
        FROM employee_group eg
        LEFT JOIN group_list gl
            ON eg.group_id = gl.id
        WHERE eg.employee_number = :employeeNumber
        ORDER BY gl.name
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':employeeNumber' => $employeeNumber,
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getPresidentDisplayData(PDO $connnew): array
{
    $sql = "
        SELECT id, firstname, surname, email, gender
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

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return [
            'emp_id' => null,
            'name' => '',
            'prefix' => '',
        ];
    }

    $prefix = ((int)$row['gender'] === 0) ? 'MR.' : 'Ms.';

    return [
        'emp_id' => (int)$row['id'],
        'name' => ucwords(strtolower(trim($row['firstname'] . ' ' . $row['surname']))),
        'prefix' => $prefix,
    ];
}

function getRequestListHeaderData(PDO $connpcs, PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    if (!hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION)) {
        throw new RuntimeException('Not authorized.');
    }

    $president = getPresidentDisplayData($connnew, $connpcs);

    $coEmp = getSetting($connpcs, 'requestlist_co_emp');
    $coEmpId = $coEmp !== null ? (int)$coEmp : 0;

    $careOf = [
        'emp_id' => null,
        'name' => '',
    ];

if ($coEmpId > 0) {
    $sql = "
        SELECT firstname, surname, gender
        FROM employee_list
        WHERE id = :id
        LIMIT 1
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute([':id' => $coEmpId]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $careOf = [
            'emp_id' => $coEmpId,
            'name' => ucwords(strtolower(trim($row['firstname'] . ' ' . $row['surname']))),
            'prefix' => ((int)$row['gender'] === 0) ? 'MR.' : 'Ms.',
        ];
    }
}

    return [
        'president' => $president,
        'care_of' => $careOf,
    ];
}