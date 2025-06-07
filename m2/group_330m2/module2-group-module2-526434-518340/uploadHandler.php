<?php 
/*
Handles upload requests.
*/

require_once "userHomeHelper.php";
require_once "databasePath.php";
require_once "existenceValidator.php";
require_once "checkSignin.php";
require_once "shellCommand.php";
session_start();
checkSignin();

$filename = basename($_FILES['uploadedfile']['name']);
check_filename($filename);

// Get the username and make sure it is valid
$username = $_SESSION['username'];
check_username($username);

$userPath = $_SESSION['userPath'];
$userFile = $_SESSION['userFile'];
if (check_file($filename, $userFile)) { // If file with the same name exists
    $_SESSION['type'] = 'duplicate_file';
    header("Location: actionResponse.php");
	exit;
}

$full_path = sprintf("%s/%s", $userPath, $filename);
if (move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $full_path)){
	// Record the file in user's list
	exec_and_catch_error("echo '^".escapeshellarg($filename)."\n' >>".escapeshellarg($userFile));
	// ^ is a customary identifier for filename

	// Success message
	$_SESSION['type'] = 'upload_success';
	header("Location: actionResponse.php");
	exit;
} else {
	$_SESSION['type'] = 'upload_failure';
	header("Location: actionResponse.php");
	exit;
}

?>