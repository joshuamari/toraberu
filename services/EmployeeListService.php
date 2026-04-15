<?php

function getFilteredEmployees(
    PDO $connpcs,
    PDO $connnew,
    PDO $connkdt,
    string $employeeNumber,
    ?string $encryptedGroupId,
    string $searchKey = ''
): array {
    if (!hasPermission($connkdt, $employeeNumber, PCS_ACCESS_PERMISSION)) {
        throw new RuntimeException('Access denied.');
    }

    $accessibleGroupIds = getAccessibleGroupIds($connnew, $connkdt, $employeeNumber);

    if (empty($accessibleGroupIds)) {
        return [];
    }

    $selectedGroupIds = $accessibleGroupIds;

    if ($encryptedGroupId !== null && $encryptedGroupId !== '' && $encryptedGroupId !== '0') {
        $decrypted = decryptGroupId($encryptedGroupId);

        if ($decrypted === null || !ctype_digit((string)$decrypted)) {
            throw new RuntimeException('Invalid group ID.');
        }

        $groupId = (int)$decrypted;

        if (!in_array($groupId, $accessibleGroupIds, true)) {
            throw new RuntimeException('Access denied.');
        }

        $selectedGroupIds = [$groupId];
    }

    $placeholders = implode(',', array_fill(0, count($selectedGroupIds), '?'));

    $searchSql = '';
    $params = array_merge([date('Y-m-01')], $selectedGroupIds);

    $searchKey = trim($searchKey);
    if ($searchKey !== '') {
        $searchSql = "
            AND (
                ed.firstname LIKE ?
                OR ed.surname LIKE ?
                OR CAST(ed.id AS CHAR) LIKE ?
            )
        ";

        $like = '%' . $searchKey . '%';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }

    $sql = "
        SELECT
            ed.id AS empID,
            ed.surname AS lastname,
            ed.firstname AS firstname,
            gl.abbreviation AS groupAbbr,
            pd.passport_expiry AS passportExpiry,
            vd.visa_expiry AS visaExpiry
        FROM kdtphdb_new.employee_list ed
        LEFT JOIN kdtphdb_new.group_list gl
            ON ed.group_id = gl.id
        LEFT JOIN passport_details pd
            ON ed.id = pd.emp_number
        LEFT JOIN visa_details vd
            ON ed.id = vd.emp_number
        WHERE (
                ed.resignation_date IS NULL
                OR ed.resignation_date = '0000-00-00'
                OR ed.resignation_date > ?
              )
          AND ed.group_id IN ($placeholders)
          $searchSql
        ORDER BY ed.id
    ";

    $stmt = $connpcs->prepare($sql);
    $stmt->execute($params);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['empID'] = (int)$row['empID'];
        $row['firstname'] = ucwords(strtolower((string)$row['firstname']));
        $row['lastname'] = ucwords(strtolower((string)$row['lastname']));
        $row['passportExpiry'] = $row['passportExpiry']
            ? date('d M Y', strtotime($row['passportExpiry']))
            : 'None';
        $row['visaExpiry'] = $row['visaExpiry']
            ? date('d M Y', strtotime($row['visaExpiry']))
            : 'None';
    }

    return $rows;
}