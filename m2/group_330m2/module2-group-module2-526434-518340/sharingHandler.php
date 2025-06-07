<?php
/*
Handles sharing requests.
*/

require_once "shellCommand.php";
require_once "userHomeHelper.php";
require_once "databasePath.php";
require_once "checkSignin.php";
require_once "existenceValidator.php";

session_start();

$filename = $_POST['filename'];
$end_user = $_POST['end_user'];
$username = $_SESSION['username'];
$userPath = $_SESSION['userPath'];
$userFile = $_SESSION['userFile'];
$endUserPath = $USER_FOLDER_PARENT_PATH."/".$end_user;
$endUserFile = sprintf("%s/%s.txt", $endUserPath, $end_user);
$cur_full_path = $userPath."/".$filename;
$target_full_path = $endUserPath."/".$filename;

// Check: User must enter from the signin page!
checkSignin();
// Check: the end user name must be valid!
check_username($end_user);
// Check the current username and filename
check_username($username);
check_filename($filename);

// Check if end user exists
$isExistingUser = check_user($end_user, $USER_LIST_PATH);
if (!$isExistingUser) {
    $_SESSION['type'] = 'share_user_nonexistence';
    header("Location: actionResponse.php");
    exit;
}

// Check the file exists in the current user's page
if (!check_file($filename, $userFile)) {
    $_SESSION['type'] = 'share_file_nonexistence';
    header("Location: actionResponse.php");
    exit;
}

// Check if file already exists in the end user's page
if (check_file($filename, $endUserFile)) {
    $_SESSION['type'] = 'duplicate_file';
    header("Location: actionResponse.php");
    exit;
}

// Copy the file, update the end user's file list
// and make a note in the current user's file list
exec_and_catch_error("cp ".escapeshellarg($cur_full_path)." ".escapeshellarg($target_full_path));
exec_and_catch_error("echo '~".escapeshellarg($filename).";".escapeshellarg($username)."\n' >>".escapeshellarg($endUserFile));
// ~ is a customary identifier for shared files
exec_and_catch_error("echo '#".escapeshellarg($filename).";".escapeshellarg($end_user)."\n' >>".escapeshellarg($userFile));
// # is a customary identifier for sharers

// Success message
$_SESSION['type'] = 'share_success';
header("Location: actionResponse.php");
exit;

?>