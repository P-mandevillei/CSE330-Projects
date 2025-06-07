<?php
/*
Displays the file per request.
*/

require_once "userHomeHelper.php";
require_once "checkSignin.php";
require_once "existenceValidator.php";
session_start();
// Ensure user is signed in
checkSignin();

$username = $_SESSION['username'];
$userPath = $_SESSION['userPath'];
$userFile = $_SESSION['userFile'];
$filename = $_GET['filename'];
// check if file exists
if (!check_file($filename, $userFile))
{
    $_SESSION['type'] = 'view_nonexistent_file';
    header('Location: actionResponse.php');
    exit;
}

// Check filename and username
check_filename($filename);
check_username($username);

// Obtain mime type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$full_path = sprintf("%s/%s", $userPath, $filename);
$mime = $finfo->file($full_path);

header("Content-Type: ".$mime);
header('content-disposition: inline; filename="'.$filename.'";');
readfile($full_path);

?>