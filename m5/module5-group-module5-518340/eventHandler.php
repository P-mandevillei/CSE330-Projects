<?php
/*
Handles event requests including queries, post, edit and delete.
*/
ini_set("session.cookie_httponly", 1);
require_once "validator.php";
require_once "dataBase.php";

header("Content-Type: application/json");

session_start();
$json_request = json_decode(file_get_contents('php://input'), true);

// Reject not signed in users
if (!isset($_SESSION['signin_calendar']) || !$_SESSION['signin_calendar']) {
    echo json_encode(["success"=>false, "msg"=>"Please First Sign In"]);
    exit;
}

// Checks if username is allowed
$username = $_SESSION['username'];
if (!check_username($username)) {
    echo json_encode(['success'=>false, 'msg'=>"Invalid Username"]);
    exit;
}

// Check for CSRF
$token = $json_request['token']?? '';
if ($token !== $_SESSION['token']) {
    echo json_encode(['success'=>false, 'msg'=>"Invalid Token"]);
    exit;
}

$type = $json_request['type']?? '';

// post new event
if ($type === 'post_event') {

    $title = $json_request['title'];
    $dateStr = $json_request['date'];
    $endStr = $json_request['end'];
    $recurOn = $json_request['recurOn'];
    $timeStr = $json_request['time'];
    $reminder = $json_request['reminder']===1? 1 : 0;

    // make sure the inputs are valid!
    reject_invalid_input($title, $dateStr, $endStr, $timeStr, $recurOn);
    
    // Insert entry
    $stmt = $mysqli->prepare("insert into events (username, date, time, title, end, recurOn, reminder) values (?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("sssssii", $username, $dateStr, $timeStr, $title, $endStr, $recurOn, $reminder);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["success"=>true, 'msg'=>"Event Added!"]);
    exit;
    
}

// delete event
else if ($type == 'delete_event') {

    $id = $json_request['id'];

    // Check unique post and user match
    // Check by BOTH id AND username of the current session to prevent attacks
    if (!check_event_id_and_user($id, $username, $mysqli)) {
        echo json_encode(['success'=>false, 'msg'=>"Event Does Not Exist!"]);
        exit;
    }   

    // delete entry
    $stmt = $mysqli->prepare("delete from events where id=? and username=?");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("is", $id, $username);
    $stmt->execute();
    $stmt->close();
    
    // Success
    echo json_encode(["success"=>true, "msg"=>"Delete Success!"]);
    exit;

}

// edit event
else if ($type == "edit_event") {

    $id = $json_request['id'];

    // Check unique post and user match
    // Check by BOTH id AND username of the current session to prevent attacks
    if (!check_event_id_and_user($id, $username, $mysqli)) {
        echo json_encode(['success'=>false, 'msg'=>"Event Does Not Exist!"]);
        exit;
    }

    $title = $json_request['title'];
    $dateStr = $json_request['date'];
    $endStr = $json_request['end'];
    $recurOn = $json_request['recurOn'];
    $timeStr = $json_request['time'];
    $reminder = $json_request['reminder']===1? 1 : 0;

    // make sure the inputs are valid!
    reject_invalid_input($title, $dateStr, $endStr, $timeStr, $recurOn);

    // Update entry
    $stmt = $mysqli->prepare("update events set title=?, date=?, time=?, end=?, recurOn=?, reminder=? where id=? and username=?");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("ssssiiis", $title, $dateStr, $timeStr, $endStr, $recurOn, $reminder, $id, $username);
    $stmt->execute();
    $stmt->close();
    
    // Success
    echo json_encode(["success"=>true, "msg"=>"Edit Success!"]);
    exit;

}

// query events on a particular day
else if ($type === "query_events") {

    // Check if the user is trying to view other's calendar
    $viewedUser = $json_request['viewed'];
    if ($viewedUser === "yourOwnCalendar") {
        $viewedUser = $username;
    }
    else 
    {
        // check sharer's username
        if (!check_username($viewedUser)) {
            echo json_encode(['success'=>false, 'msg'=>"Invalid Sharer Username"]);
            exit;
        }
        // Check if the sharing relation exists
        if (!check_share($viewedUser, $username, $mysqli)) {
            echo json_encode(['success'=>false, 'msg'=>"You are not authorized to view their calendar!"]);
            exit;
        }
    }

    $dateStr = $json_request['date'];
    $weekDay = $json_request['week'];
    $weekBin = 1<<(6-$weekDay);

    $stmt = $mysqli->prepare(
        "select id, title, time, reminder, end>date from events where username=? and date<=? and end>=? and (recurOn & ?)!=0 order by time asc"
    );
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("sssi", $viewedUser, $dateStr, $dateStr, $weekBin);
    $stmt->execute();

    $id = -1;
    $title = "";
    $time = "";
    $reminder = 0;
    $isRecurring = false;
    $results = array();
    $stmt->bind_result($id, $title, $time, $reminder, $isRecurring);
    
    while ($stmt->fetch()) {
        array_push($results, [$time, $title, $id, $reminder, $isRecurring]);
    }
    $stmt->close();

    echo json_encode(['success'=>true, 'events'=>$results]);
    exit;
}

// catch illegal arrivals
else {
    echo json_encode(['success'=>false, 'msg'=>"You Seem To Have Submitted An Unrecognized Request!"]);
    exit;
}
?>