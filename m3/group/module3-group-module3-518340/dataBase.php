<?php
/*
This file contains the mysqli instance used to interact with MySQL database.
*/

$mysqli = new mysqli('localhost', 'CSE330', 'btydzhcse330', 'CSE330M3');

if ($mysqli->connect_error) {
    printf("Connection Failed: %s\n", $mysqli->connect_error);
    exit;
}

// The second instance of mysqli for use in searching secondary comments when the search for primary comments is still open
$mysqli2 = new mysqli('localhost', 'CSE330', 'btydzhcse330', 'CSE330M3');

if ($mysqli2->connect_error) {
    printf("Connection Failed: %s\n", $mysqli2->connect_error);
    exit;
}

?>