<?php

function getCurrentUserHash(): string
{
    $userHash = $_COOKIE['userID'] ?? '';

    if ($userHash === '') {
        throw new RuntimeException('Not logged in.');
    }

    return $userHash;
}

function getCurrentEmployeeNumber(PDO $connkdt): string
{
    $userHash = getCurrentUserHash();

    $sql = "
        SELECT fldEmployeeNum
        FROM kdtlogin
        WHERE fldUserHash = :userHash
        LIMIT 1
    ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute([
        ':userHash' => $userHash,
    ]);

    $employeeNumber = $stmt->fetchColumn();

    if (!$employeeNumber) {
        throw new RuntimeException('User not found.');
    }

    return (string)$employeeNumber;
}