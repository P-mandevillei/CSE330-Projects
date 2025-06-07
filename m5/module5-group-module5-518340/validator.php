<?php
/*
This helper file contains functions used for checking input or checking the existence of usernames, etc.
*/

function check_username($username) {
    /*
    Allows only usernames <= 12 characters with certain characters.
    */
    return preg_match('/^[\w_\-]{1,12}$/', $username);
}

function check_user($username, $mysqli) {
    /*
    Checks if the given user already exists.
    Returns the number of users with the same username in the database.
    */
    $stmt = $mysqli->prepare("select count(*) from users where username=?");
    if (!$stmt) {return false;}
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $return_count = -1;
    $stmt->bind_result($return_count);
    $stmt->fetch();
    $stmt->close();
    return $return_count;
}

function check_user_password($username, $password, $mysqli) {
    /*
    Checks if a given user has the correct password.
    Returns True if the username and password match.
    Returns False otherwise.
    */
    $stmt = $mysqli->prepare("select count(*), password from users where username=?");
    if (!$stmt) {return false;}
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $return_count = -1;
    $return_password = "";
    $stmt->bind_result($return_count, $return_password);
    $stmt->fetch();
    $stmt->close();

    // If the user is unique and has the right password
    return $return_count===1 && password_verify($password, $return_password);
}

function check_title($title) {
    // title must be 1-255 characters long and cannot include special characters
    return preg_match("/^[-\w\s,?!.;'\"(){}\[\]]{1,255}$/", $title);
}

function check_date($dateStr) {
    // checks if the date is a valid date
    // dateStr should be a string with the format yyyyymmdd
    $year = (int)substr($dateStr, 0, 5);
    $month = (int)substr($dateStr, 5, 2);
    $date = (int)substr($dateStr, 7, 2);
    return checkdate($month, $date, $year);
}

function check_time($timeStr) {
    // checks if the time is valid
    // timeStr should be a string with the format hhmm
    $hour = (int)substr($timeStr, 0, 2);
    $min = (int)substr($timeStr, 2, 2);
    return $hour>=0 && $hour<=23 && $min>=0 && $min<=59;
}

function check_recur($recurOn) {
    // checks if recurOn is valid
    // recurOn should be a 7-bit value of (Sun Mon Tue Wed Thu Fri Sat)
    // where each bit indicates if the event occurs on that day
    return $recurOn>0 && $recurOn<=127;
}
function check_event_id_and_user($id, $username, $mysqli) {
    // checks if the id and username matches one and only one event
    $stmt = $mysqli->prepare("select count(*) from events where id=? and username=?");
    if (!$stmt) { return false; }
    $stmt->bind_param("is", $id, $username);
    $stmt->execute();

    $count = 0;
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    return $count === 1;
}

function reject_invalid_input($title, $dateStr, $endStr, $timeStr, $recurOn) {
    // Checks if all five input fields are valid.
    // If not, abort and return an error message with the format {"succcess": false, "msg": <msg>}
    if (!check_title($title)) {
        echo json_encode(['success'=>false, 'msg'=>"Title must be 1-255 characters long and can only include letters, numbers and any of the following: _-,?!.;'\"()[]{}"]);
        exit;
    }
    if (!check_date($dateStr)) { 
        echo json_encode(['success'=>false, 'msg'=>"Invalid Date"]);
        exit;
    }
    if (!check_date($endStr)) { 
        echo json_encode(['success'=>false, 'msg'=>"Invalid Date"]);
        exit;
    }
    if (!($endStr>=$dateStr)) {
        echo json_encode(['success'=>false, 'msg'=>"End Date Must Be After The Start Date!"]);
        exit;
    }
    if (!check_recur($recurOn)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Recurrence!"]);
        exit;
    }
    if (!check_time($timeStr)) { 
        echo json_encode(['success'=>false, 'msg'=>"Invalid Time"]);
        exit;
    }
}

function check_share($sharer, $sharee, $mysqli) {
    // check for entry (sharer, sharee) in the table shares
    $stmt = $mysqli->prepare("select count(*) from shares where sharer=? and sharee=?");
    if (!$stmt) { return false; }
    $stmt->bind_param("ss", $sharer, $sharee);
    $stmt->execute();

    $count = -1;
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    return $count === 1;
}

function check_email($email) {
    // check if the email address is valid
    // https://stackoverflow.com/questions/8242567/acceptable-field-type-and-size-for-email-address
    return preg_match("/^[\w!#$%&'*+\/=?^_`{|}~.-]+@([\w\-]+(?:\.[\w\-]+)+)$/", $email) 
        && strlen($email)<=255;
}

?>