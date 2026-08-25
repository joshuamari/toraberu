<?php

function getWhatsNewReleases(string $currentVersion = ''): array
{
    $releases = [
        [
            'version' => '1.1.0',
            'date' => '2026-08-25',
            'highlights' => [
                [
                    'type' => 'added',
                    'text' => 'Re-entry permit for employees (alongside passport and visa), with expiry on Employee List, dashboard alerts, and Report',
                ],
                [
                    'type' => 'added',
                    'text' => 'Change Requests page in Toraberu to monitor date-change and cancellation requests from KHI (approve or deny: president only)',
                ],
                [
                    'type' => 'added',
                    'text' => 'Activity history on Request List, showing dispatch and change-request events for each request',
                ],
                [
                    'type' => 'changed',
                    'text' => 'Redesigned dashboard, with summary cards, on-process dispatches, document alerts, and a dispatch list',
                ],
                [
                    'type' => 'changed',
                    'text' => 'Updated Request List and the other main screens (Employee List, Employee Details, Check Availability, Report)',
                ],
                [
                    'type' => 'removed',
                    'text' => 'Direct cancellation by the president in Toraberu. Cancellations now come from KHI and are reviewed in Change Requests',
                ],
            ],
        ],
        [
            'version' => '1.0.0',
            'date' => '2023-12-05',
            'highlights' => [
                [
                    'type' => 'added',
                    'text' => 'Initial release of Toraberu',
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
