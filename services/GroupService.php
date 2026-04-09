<?php

function encryptGroupId(string $groupId): string
{
    return openssl_encrypt(
        $groupId,
        'AES-256-CBC',
        'PCSGROUPENC',
        0,
        'HAHTASDFSDFT6634'
    );
}

function getAccessibleGroups(PDO $connnew, PDO $connkdt, string $employeeNumber): array
{
    $hasAllGroupAccess = hasPermission($connkdt, $employeeNumber, PCS_ALL_GROUP_PERMISSION);

    if ($hasAllGroupAccess) {
        $sql = "
            SELECT 
                gl.id,
                gl.name,
                gl.abbreviation,
                (
                    SELECT COUNT(*)
                    FROM employee_list el
                    WHERE el.group_id = gl.id
                      AND el.emp_status = 1
                ) AS empCount
            FROM group_list gl
            HAVING empCount > 0
            ORDER BY gl.name
        ";

        $stmt = $connnew->prepare($sql);
        $stmt->execute();
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $sql = "
            SELECT 
                gl.id,
                gl.name,
                gl.abbreviation
            FROM employee_group eg
            LEFT JOIN group_list gl ON eg.group_id = gl.id
            WHERE eg.employee_number = :employeeNumber
            ORDER BY gl.name
        ";

        $stmt = $connnew->prepare($sql);
        $stmt->execute([
            ':employeeNumber' => $employeeNumber,
        ]);

        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    foreach ($groups as &$group) {
        $group['newID'] = encryptGroupId((string)$group['id']);
        unset($group['id']);
    }

    return $groups;
}