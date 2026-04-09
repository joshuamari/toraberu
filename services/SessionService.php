<?php

function getSessionData(PDO $connkdt, string $employeeNumber): array
{
    $sql = "
        SELECT 
            ep.fldEmployeeNum,
            ep.fldSurname,
            ep.fldFirstname,
            kb.fldBUName
        FROM emp_prof ep
        JOIN kdtbu kb ON ep.fldGroup = kb.fldBU
        WHERE ep.fldEmployeeNum = :employeeNumber
        LIMIT 1
    ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute([
        ':employeeNumber' => $employeeNumber,
    ]);

    $employee = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$employee) {
        throw new RuntimeException('Employee profile not found.');
    }

    $permissions = getUserPermissions($connkdt, $employeeNumber);

    if (!$permissions['hasAccess']) {
        throw new RuntimeException('Access denied.');
    }

    return [
        'id' => $employee['fldEmployeeNum'],
        'empname' => [
            'firstname' => $employee['fldFirstname'],
            'surname' => $employee['fldSurname'],
        ],
        'group' => $employee['fldBUName'],
        'permissions' => $permissions,
    ];
}