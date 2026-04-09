<?php

function hasPermission(PDO $connkdt, string $employeeNumber, int $permissionId): bool
{
    $sql = "
        SELECT COUNT(*)
        FROM user_permissions
        WHERE permission_id = :permissionId
          AND fldEmployeeNum = :employeeNumber
    ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute([
        ':permissionId' => $permissionId,
        ':employeeNumber' => $employeeNumber,
    ]);

    return (int)$stmt->fetchColumn() > 0;
}

function getUserPermissions(PDO $connkdt, string $employeeNumber): array
{
    return [
        'hasAccess' => hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION),
        'hasEdit' => hasPermission($connkdt, $employeeNumber, PCS_EDIT_PERMISSION),
        'hasAllGroupAccess' => hasPermission($connkdt, $employeeNumber, PCS_ALL_GROUP_PERMISSION),
        'hasRequestListAccess' => hasPermission($connkdt, $employeeNumber, PCS_REQUEST_LIST_PERMISSION),
    ];
}