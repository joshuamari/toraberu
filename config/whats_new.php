<?php

function getWhatsNewReleases(string $currentVersion = ''): array
{
    $releases = [
        [
            'version' => '1.1.0',
            'date' => '2026-08-20',
            'highlights' => [
                [
                    'type' => 'added',
                    'text' => 'Change Requests page for reviewing date-change and cancellation requests',
                ],
                [
                    'type' => 'added',
                    'text' => 'Activity history on Request List',
                ],
                [
                    'type' => 'added',
                    'text' => 'Re-entry permit on employee screens, dashboard, and Report',
                ],
                [
                    'type' => 'added',
                    'text' => 'Dashboard cards for on-process dispatches and expiring passport or visa',
                ],
                [
                    'type' => 'added',
                    'text' => 'Email when a change request is approved or denied',
                ],
                [
                    'type' => 'changed',
                    'text' => 'Dashboard, Request List, and Change Requests layout and alerts',
                ],
            ],
        ],
        [
            'version' => '1.0.0',
            'date' => '2023-12-05',
            'highlights' => [
                [
                    'type' => 'added',
                    'text' => 'Initial release of トラベる',
                ],
            ],
        ],
    ];

    foreach ($releases as &$release) {
        $release['current'] = $release['version'] === $currentVersion;
    }
    unset($release);

    return $releases;
}
