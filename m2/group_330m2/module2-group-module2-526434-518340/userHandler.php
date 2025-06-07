<?php
/*
Handles signin and signup requests.
*/

require_once "existenceValidator.php";
require_once "databasePath.php";
require_once "userHomeHelper.php";
require_once "shellCommand.php";

// Ensure user arrives at this page from the right path
if (!isset($_POST) or $_POST['username']==null) {
    header("Location: fileSharer.php");
    exit;
}

// Initialization
session_start();
$_SESSION = array();
$type = $_POST['type'];
$_SESSION['type'] = $type;
$username = $_POST['username'];
$isExisting = check_user($username, $USER_LIST_PATH); 
$_SESSION['isExisting'] = $isExisting;
$USER_FOLDER_PATH = "$USER_FOLDER_PARENT_PATH/$username";
$USER_FOLDER_FILE = "$USER_FOLDER_PATH/$username.txt";


// Ensure username is valid
signup_check_username($username);

// Handle signup
if ($type == 'signup') {
    if (!$isExisting) { 
        // Record the username and make a folder
        file_put_contents($USER_LIST_PATH,
                        $username."\n",
                        FILE_APPEND);
        exec_and_catch_error("mkdir ".escapeshellarg($USER_FOLDER_PATH));
        exec_and_catch_error("echo '*".escapeshellarg($username)."\n' >> ".escapeshellarg($USER_FOLDER_FILE));
        // * is a customary identifier for username
    }
    header("Location: actionResponse.php");
    exit;
} 

// Handle signin
else if ($type == 'signin') {
    if (!$isExisting) {
        header("Location: actionResponse.php");
        exit;
    } else {
        // Initialization
        $_SESSION['username'] = $username;
        $_SESSION['signin'] = "SUCCESS";
        $_SESSION['userPath'] = $USER_FOLDER_PATH;
        $_SESSION['userFile'] = $USER_FOLDER_FILE;

        header("Location: userHome.php");
        exit;
    }
} 

// Catch illegal arrivals
else {
    $_SESSION = array();
    session_destroy();
    header("Location: fileSharer.php");
    exit;
}

?>