<?php
/*
Handles sharing requests.
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

// add new sharing relation
if ($type === 'add_share') {

    $sharee = $json_request['sharee'];
    // check if the sharee name is valid
    if (!check_username($sharee)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Sharee Username"]);
        exit;
    }
    // Checks if the sharee exists
    if (check_user($sharee, $mysqli)!==1) {
        echo json_encode(['success'=>false, 'msg'=>"Sharee Does Not Exist"]);
        exit;
    }
    // check if the sharing relation exists
    if (check_share($username, $sharee, $mysqli)) {
        echo json_encode(['success'=>false, 'msg'=>"Sharing Failed: Already Sharing!"]);
        exit;
    }
    // Cannot share with yourself!
    if ($sharee == $username) {
        echo json_encode(['success'=>false, 'msg'=>"Sharing Failed: Cannot Share With Yourself!"]);
        exit;
    }

    // Insert entry
    $stmt = $mysqli->prepare("insert into shares (sharer, sharee) values (?, ?)");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("ss", $username, $sharee);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["success"=>true, 'msg'=>"Shared!"]);
    exit;
    
}

// retrieve sharees by the current user and sharers whose sharee is the current user
else if ($type == 'get_shares') {
    $stmt = $mysqli->prepare("select sharee from shares where sharer=?");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $sharee = "";
    $sharees = [];
    $stmt->bind_result($sharee);
    while ($stmt->fetch()) {
        array_push($sharees, $sharee);
    }
    $stmt->close();

    $stmt = $mysqli->prepare("select sharer from shares where sharee=?");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $sharer = "";
    $sharers = [];
    $stmt->bind_result($sharer);
    while ($stmt->fetch()) {
        array_push($sharers, $sharer);
    }
    $stmt->close();

    echo json_encode(['success'=>true, 'sharees'=>$sharees, 'sharers'=>$sharers]);
    exit;
}

// delete share
else if ($type == 'delete_share') {

    $sharee = $json_request['sharee'];

    // check if the sharee name is valid
    if (!check_username($sharee)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Sharee Username"]);
        exit;
    }
    // Checks if the sharee exists
    if (check_user($sharee, $mysqli)!==1) {
        echo json_encode(['success'=>false, 'msg'=>"Sharee Does Not Exist"]);
        exit;
    }
    // check if the sharing relation exists
    if (!check_share($username, $sharee, $mysqli)) {
        echo json_encode(['success'=>false, 'msg'=>"Error: Cannot Unshare What You Haven't Shared!"]);
        exit;
    }

    // delete entry
    $stmt = $mysqli->prepare("delete from shares where sharer=? and sharee=?");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("ss", $username, $sharee);
    $stmt->execute();
    $stmt->close();
    
    // Success
    echo json_encode(["success"=>true, "msg"=>"Unshare Success!"]);
    exit;

}

// catch illegal arrivals
else {
    echo json_encode(['success'=>false, 'msg'=>"You Seem To Have Submitted An Unrecognized Request!"]);
    exit;
}
?>