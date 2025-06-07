<?php
/*
This file contains the mysqli instance used to interact with MySQL database.
*/

$mysqli = new mysqli('localhost', 'CSE330', 'btydzhcse330', 'CSE330M5');

if ($mysqli->connect_error) {
    printf("Connection Failed: %s\n", $mysqli->connect_error);
    exit;
}

?>