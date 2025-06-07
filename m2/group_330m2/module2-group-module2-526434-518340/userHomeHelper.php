<?php
/*
Helper file for userHome.php
Contains functions that displays user's file records, generate various buttons,
And check the validity of usernames and filenames.
*/

// User File Identifier:
// * is followed by username;
// ^ is followed by filename;
// ~ means shared file: ~filename;sharerUsername;
// # means sharer file: #filename;recipientUsername
function read_and_display($user_file_path) { 
    $h = fopen($user_file_path, "r");
    echo "<table>\n";
    echo "<tr> <th>File</th> <th>Action</th> <th>View</th> <th>Delete</th> <th>Share</th> </tr>";
    while (!feof($h)) {
        $line = trim(fgets($h));
        $identifier = substr($line, 0, 1);
        // username
        if ($identifier=='*') { 
            continue;
        }
        // owned file
        else if ($identifier=='^') { 
            $filename = substr($line, 1, null);
            echo "<tr>\n";
            printf("\t<td>%s</td>\n", htmlentities($filename)); // file
            echo "<td></td>\n"; // action
            viewButton($filename); // view
            deleteFileButton($filename); // delete
            shareButton($filename); // share
            echo "</tr>\n";
        }
        // sharer
        else if ($identifier=='#') { 
            $filename = explode(";", substr($line, 1, null))[0];
            $recipient = explode(";", substr($line, 1, null))[1];
            echo "<tr>\n";
            printf("\t<td>%s</td>\n", htmlentities($filename)); // file
            printf("\t<td>Sharing With %s</td>\n", htmlentities($recipient)); // action
            echo "<td></td>\n"; // view
            echo "<td></td>\n"; // delete
            stopSharingButton($filename, $recipient); // share
            echo "</tr>\n";
        }
        // recipient
        else if ($identifier=='~') { 
            $filename = explode(";", substr($line, 1, null))[0];
            $sharer = explode(";", substr($line, 1, null))[1];
            echo "<tr>\n";
            printf("\t<td>%s</td>\n", htmlentities($filename)); // file
            printf("\t<td>Shared By %s</td>\n", htmlentities($sharer)); // action
            viewButton($filename); // view
            deleteFileButton($filename); // delete
            echo "<td></td>\n"; // Does not allow re-share
            echo "</tr>\n";
        }
    }
    echo "</table>\n";
    fclose($h);
}

function viewButton($filename) {
    // Generates a view file button that redirects user to viewer.php
    $output_filename = htmlentities($filename);
    echo "\t<td>\n";
    echo "\t<form action='viewer.php' method='GET'>\n";
    echo "\t\t<input type='hidden' name='filename' value='$output_filename'>\n";
    echo "\t\t<input type='submit' value='view'>\n";
    echo "\t</form>\n";
    echo "\t</td>\n";
}

function shareButton($filename) {
    // Generates a share file button that redirects user to sharingPage.php
    $output_filename = htmlentities($filename);
    echo "\t<td>\n";
    echo "\t<form action='sharingPage.php' method='GET'>\n";
    echo "\t\t<input type='hidden' name='filename' value='$output_filename'>\n";
    echo "\t\t<input type='submit' value='share'>\n";
    echo "\t</form>\n";
    echo "\t</td>\n";
}

function stopSharingButton($filename, $recipient) {
    // Generates a stop sharing button that redirects user to deleteHandler.php
    $output_filename = htmlentities($filename);
    $output_recipient = htmlentities($recipient);
    echo "\t<td>\n";
    echo "\t<form action='deleteHandler.php' method='POST'>\n";
    echo "\t\t<input type='hidden' name='type' value='stop_sharing'>\n";
    echo "\t\t<input type='hidden' name='name' value='$output_filename'>\n";
    echo "\t\t<input type='hidden' name='recipient' value='$output_recipient'>\n";
    echo "\t\t<input type='submit' value='stop sharing'>\n";
    echo "\t</form>\n";
    echo "\t</td>\n";
}

function deleteFileButton($filename) {
    // Generates a delete file button that redirects to deleteHandler.php
    $output_filename = htmlentities($filename);
    echo "\t<td>\n";
    echo "\t<form action='deleteHandler.php' method='POST'>\n";
    echo "\t\t<input type='hidden' name='type' value='file'>\n";
    echo "\t\t<input type='hidden' name='name' value='$output_filename'>\n";
    echo "\t\t<input type='submit' value='delete'>\n";
    echo "\t</form>\n";
    echo "\t</td>\n";
}

function deleteAccountButton() {
    // Generates a delete account button that redirects to deleteHandler.php
    echo "\t<form action='deleteHandler.php' method='POST'>\n";
    echo "\t\t<input type='hidden' name='type' value='account'>\n";
    echo "\t\t<input type='submit' value='Delete Account'>\n";
    echo "\t</form>\n";
}

function check_username($username) {
    // Must start session before calling
    // Redirects to homepage
    if (!preg_match('/^[\w_\-]+$/', $username)) {
        $_SESSION['type'] = 'invalid_username';
        header('Location: actionResponse.php');
        exit;
    }
}

function signup_check_username($username) {
    // Must start session before calling
    // Redirects to signin
    if (!preg_match('/^[\w_\-]+$/', $username)) {
        $_SESSION['type'] = 'signup_invalid_username';
        header('Location: actionResponse.php');
        exit;
    }
}

function check_filename($filename) {
    // Must start session before calling
    // Redirects to homepage
    if (!preg_match('/^[\w_\.\-]+$/', $filename)) {
        $_SESSION['type'] = 'invalid_filename';
        header('Location: actionResponse.php');
        exit;
    }
}

?>