<?php

require_once __DIR__ . '/../helpers/env.php';

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
