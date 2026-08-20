<?php

require_once __DIR__ . '/../helpers/env.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/app.php';

header('Content-Type: application/json; charset=UTF-8');

jsonSuccess([
    'version' => getAppConfig()['version'] ?? '',
], 'Version loaded successfully.');
