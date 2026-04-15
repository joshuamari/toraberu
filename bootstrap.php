<?php

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

require_once __DIR__ . '/helpers/env.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/mailer.php';

require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/permissions.php';

// require_once __DIR__ . '/dbconn/dbconnectkdtph.php';
// require_once __DIR__ . '/dbconn/dbconnectpcs.php';
// require_once __DIR__ . '/dbconn/dbconnectnew.php';

require_once __DIR__ . '/dbconn_new/dbconnectkdtph.php';
require_once __DIR__ . '/dbconn_new/dbconnectpcs.php';
require_once __DIR__ . '/dbconn_new/dbconnectnew.php';

require_once __DIR__ . '/services/AuthService.php';
require_once __DIR__ . '/services/DashboardService.php';
require_once __DIR__ . '/services/PermissionService.php';
require_once __DIR__ . '/services/SessionService.php';
require_once __DIR__ . '/services/GroupService.php';

require_once __DIR__ . '/services/RequestListService.php';
require_once __DIR__ . '/services/EmailService.php';

require_once __DIR__ . '/services/AppSettingsService.php';

require_once __DIR__ . '/services/EmployeeListService.php';

header('Content-Type: application/json; charset=UTF-8');