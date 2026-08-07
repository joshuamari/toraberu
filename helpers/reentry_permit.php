<?php

/**
 * Latest Re-entry Permit validity — same rules as Employee Details
 * (getEmployeeReentryPermit / reentryPermitDisplay).
 *
 * @param bool $hasPermitRecord Whether a reentry_permit_details row exists
 * @param mixed $onProcess on_process flag from the permit row
 * @param mixed $expiry permit_expiry date string (or empty)
 * @return string Status key: valid | valid_expiring | on_process | invalid | missing
 */
function resolveReentryPermitStatus(bool $hasPermitRecord, $onProcess, $expiry): string
{
    if (!$hasPermitRecord) {
        // Employee Details empty state ("No Re-entry Permit found.") —
        // parallel to Missing Passport / Missing Visa in activity readiness.
        return 'missing';
    }

    if ((int) $onProcess === 1) {
        return 'on_process';
    }

    if (!empty($expiry)) {
        $expiryTs = strtotime((string) $expiry);
        $todayTs = strtotime(date('Y-m-d'));

        if ($expiryTs !== false && $expiryTs >= $todayTs) {
            $warningMonths = function_exists('envInt')
                ? envInt('REENTRY_PERMIT_EXPIRY_WARNING_MONTHS', 6)
                : 6;

            if ($warningMonths < 1) {
                $warningMonths = 6;
            }

            $warningCutoff = strtotime('+' . $warningMonths . ' months');

            return ($expiryTs <= $warningCutoff)
                ? 'valid_expiring'
                : 'valid';
        }
    }

    // Row exists but expiry is past / missing → Employee Details "Expired"
    return 'invalid';
}
