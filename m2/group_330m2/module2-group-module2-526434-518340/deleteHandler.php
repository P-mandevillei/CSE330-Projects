<?php
/*
Helper method that handles delete requests.
Deletes accounts, files and stops the sharing of files.
*/

require_once "databasePath.php";
require_once "checkSignin.php";
require_once "existenceValidator.php";
require_once "shellCommand.php";
require_once "userHomeHelper.php";
session_start();
checkSignin();

$username = $_SESSION['username'];
$userPath = $_SESSION['userPath'];
$userFile = $_SESSION['userFile'];
$type = $_POST['type'];

if ($type == 'account') {
    if (check_user($username, $USER_LIST_PATH)) { // user exists
        // Update user file
        $deleted_list = delete_account($username, $USER_LIST_PATH);
        file_put_contents($USER_LIST_PATH, $deleted_list);
        // Delete user folder
        exec_and_catch_error("rm -rf ".escapeshellarg($userPath));
        // Redirect message
        $_SESSION['type'] = 'delete_account_success';
        header("Location: actionResponse.php");
        exit;
    } else { // File not found
        $_SESSION['type'] = 'delete_account_not_found';
        header("Location: actionResponse.php");
        exit;
    }
} 

else if ($type == 'file') {
    $name = $_POST['name'];
    // check filename
    check_filename($name);
    if (check_file($name, $userFile)) { // File exists
        // Update user file
        $deleted_list = delete_file($name, $userFile);
        file_put_contents($userFile, $deleted_list);
        // Delete file
        $full_path = sprintf("%s/%s", $userPath, $name);
        exec_and_catch_error("rm ".escapeshellarg($full_path));
        // Redirect message
        $_SESSION['type'] = 'delete_file_success';
        header("Location: actionResponse.php");
        exit;
    } else { // File not found
        $_SESSION['type'] = 'delete_file_not_found';
        header("Location: actionResponse.php");
        exit;
    }
}

else if ($type == 'stop_sharing') {
    $name = $_POST['name'];
    $recipient = $_POST['recipient'];
    // check filename and recipient's username
    check_filename($name);
    check_username($recipient);

    $recipientPath = $USER_FOLDER_PARENT_PATH."/".$recipient;
    $recipientFile = sprintf("%s/%s.txt", $recipientPath, $recipient);

    $sharerFileExists = check_sharer($name, $userFile, $recipient);
    // If the sharer file doesn't exist: refuse request
    if (!$sharerFileExists) {
        $_SESSION['type'] = 'stop_share_file_nonexistence';
        header("Location: actionResponse.php");
        exit;
    }

    $recipientExists = check_user($recipient, $USER_LIST_PATH);
    // If the recipient hasn't deleted their account
    if ($recipientExists) {
        $sharedFileExists = check_file($name, $recipientFile);

        // If the recipient has not deleted the file:
        // Delete the file, and update records for both the current user and the recipient
        if ($sharedFileExists) {
            // Update recipient's user file
            $deleted_list = delete_file($name, $recipientFile);
            file_put_contents($recipientFile, $deleted_list);
            // Delete recipient's file copy
            $full_path = sprintf("%s/%s", $recipientPath, $name);
            exec_and_catch_error("rm ".escapeshellarg($full_path));
            // Update current user file
            $deleted_list = delete_sharer($name, $userFile, $recipient);
            file_put_contents($userFile, $deleted_list);
            // Redirect message
            $_SESSION['type'] = 'stop_sharing_success';
            header("Location: actionResponse.php");
            exit;
        }

        // If the recipient has deleted the file:
        // Only need to update record for the current user
        else {
            // Update current user file
            $deleted_list = delete_sharer($name, $userFile, $recipient);
            file_put_contents($userFile, $deleted_list);
            // Redirect message
            $_SESSION['type'] = 'stop_sharing_success';
            header("Location: actionResponse.php");
            exit;
        }
    }

    // If the recipient has deleted their account:
    // Only need to update the current user's file list
    else {
        // Update current user file
        $deleted_list = delete_sharer($name, $userFile, $recipient);
        file_put_contents($userFile, $deleted_list);
        // Redirect message
        $_SESSION['type'] = 'stop_sharing_success';
        header("Location: actionResponse.php");
        exit;
    }
        
}

?>