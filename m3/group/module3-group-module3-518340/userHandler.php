<?php
/*
This processor page handles signin, signup requests.
*/
require_once "validator.php";
require_once "dataBase.php";
require_once "viewProfileHelper.php";
require_once "homepageHelper.php";

session_start();
$username = false;
initialize_session($username);
$_SESSION['last_visit'] = $_SESSION['now'];
$_SESSION['now'] = 'userHandler';

// Check for CSRF
if (isset($_POST['token'])) {
    $token = $_POST['token'];
} else {
    $token = '';
}

if ($token != $_SESSION['token']) {
    $_SESSION['type'] = 'invalid_token';
    header("Location: actionResponse.php");
    exit;
}

if (isset($_POST['type'])) {
    $type = $_POST['type'];
} else {
    $type = '';
}

// Handles signin
if ($type == 'signin') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    // Checks if username is allowed
    check_username($username);
    // If password matchs: redirect to homepage.
    // Otherwise redirect to signin.
    if (check_user_password($username, $password, $mysqli)) {
        $_SESSION['signin_newsViewer'] = true;
        $_SESSION['username'] = $username;
        header("Location: homepage.php");
        exit;
    } else {
        $_SESSION['type'] = 'signin_failed';
        header("Location: actionResponse.php");
        exit;
    }
}

// Handles signup
else if ($type == 'signup') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    // Checks if username is allowed
    check_username($username);
    // Checks if the user already exists
    if (check_user($username, $mysqli)!=0) {
        $_SESSION['type'] = 'signup_user_exists';
        header("Location: actionResponse.php");
        exit;
    }
    // Hash and salt the password
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert username and password into database
    $stmt = $mysqli->prepare("Insert into users (username, password) values (?, ?)");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("ss", $username, $hash);
    execute_stmt($stmt, $mysqli);
    $stmt->close();

    // Success: redirect to signin
    $_SESSION['type'] = 'signup_success';
    header("Location: actionResponse.php");
    exit;
}

else if ($type == 'signout') {
    
    // check if user is signed in
    if (!isset($_SESSION['signin_newsViewer']) || !$_SESSION['signin_newsViewer']) {
        $_SESSION['type'] = 'invalid_signout';
        header("Location: actionResponse.php");
        exit;
    }
    // destroy session
    $_SESSION = array();
    session_destroy();
    header("Location: homepage.php");
    
}

// Create follower
else if ($type == 'follow') {

    $follower = $_POST['follower'];
    $followee = $_POST['followee'];
    check_username($follower);
    check_username($followee);
    // make sure both users exist
    if (check_user($follower, $mysqli)!=1 || check_user($followee, $mysqli)!=1) {
        $_SESSION['type'] = 'user_DNE';
        header("Location: actionResponse.php");
        exit;
    }

    // Cannot follow yourself!
    if ($follower == $followee) {
        $_SESSION['type'] = 'self_follow';
        header("Location: actionResponse.php");
        exit;
    }

    // if already following: redirect
    if (check_follow($follower, $followee, $mysqli)) {
        $_SESSION['type'] = 'already_following';
        header("Location: actionResponse.php");
        exit;
    }

    // insert entry
    $stmt = $mysqli->prepare("insert into follows (follower_username, followee_username) values (?, ?)");
    $stmt->bind_param("ss", $follower, $followee);
    execute_stmt($stmt, $mysqli);
    $stmt->close();

    // redirect back to profile page
    header("Location: viewProfile.php?username=$followee");
    exit;

}

// delete follower
else if ($type == 'unfollow') {

    $follower = $_POST['follower'];
    $followee = $_POST['followee'];
    check_username($follower);
    check_username($followee);
    // make sure both users exist
    if (check_user($follower, $mysqli)!=1 || check_user($followee, $mysqli)!=1) {
        $_SESSION['type'] = 'user_DNE';
        header("Location: actionResponse.php");
        exit;
    }

    // Cannot unfollow yourself!
    if ($follower == $followee) {
        $_SESSION['type'] = 'self_unfollow';
        header("Location: actionResponse.php");
        exit;
    }

    // if already unfollowed: redirect
    if (!check_follow($follower, $followee, $mysqli)) {
        $_SESSION['type'] = 'already_unfollowed';
        header("Location: actionResponse.php");
        exit;
    }

    // delete entry
    $stmt = $mysqli->prepare("delete from follows where follower_username=? and followee_username=?");
    $stmt->bind_param("ss", $follower, $followee);
    execute_stmt($stmt, $mysqli);
    $stmt->close();

    // redirect back to profile page
    header("Location: viewProfile.php?username=$followee");
    exit;

}

// catch illegal arrivals
else {
    header("Location: homepage.php");
    exit;
}


?>