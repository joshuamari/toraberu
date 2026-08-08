<?php
#region Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods');
#endregion

$result = [
    "isSuccess" => FALSE,
    "message" => "Change requests can only be submitted from PCSKHI",
    "data" => array()
];

echo json_encode($result);
