<?php
/*
Contains functions that check whether files and users exist,
And also function to return a userList or fileList text with the target name deleted.
*/

// User File Identifier:
// * is followed by username;
// ^ is followed by filename;
// ~ means shared file: ~filename;sharerUsername;
// # means sharer file: #filename;recipientUsername


// check if the file exists in the user's file list
function check_file($filename, $user_file_path) {
    $h = fopen($user_file_path, "r"); // open file in read mode
    $found = False; // set the initial value to the file is not found 
    while (!feof($h)) { 
        $line = trim(fgets($h)); 
        $identifier = substr($line, 0, 1); // extract the first character as identifier
        
        if ($identifier=='*' || $identifier=='#') { // is username or sharer
            continue;
        }
        else if ($identifier=='^') { // is filename
            $name = substr($line, 1, null);
            if ($name == $filename) { // compare with the targeted file name
                $found = True;
            }
        } else if ($identifier=='~') { // is shared file
            $name = explode(";", substr($line, 1, null))[0];
            if ($name == $filename) { 
                $found = True;
            }
        }
    }
    fclose($h); 
    return $found; // whether the file is found 
}

// check if the user is the sharer of a specific recipient 
function check_sharer($filename, $user_file_path, $recipient) {
    $h = fopen($user_file_path, "r"); 
    $found = False;
    while (!feof($h)) { // read the file 
        $line = trim(fgets($h));
        $identifier = substr($line, 0, 1);
        
        if ($identifier=='#') { // is sharer
            $name = explode(";", substr($line, 1, null))[0]; // extract file name 
            $cur_recipient = explode(";", substr($line, 1, null))[1]; // recipient user name 
            if ($name == $filename && $cur_recipient == $recipient) { // check if both match 
                $found = True;
            }
        }
    }
    fclose($h);
    return $found;
}


// check if the user is in the user list 
function check_user($username, $user_list_path) {
    $h = fopen($user_list_path, "r"); // open the user list in reader mode 
    $found = False;
    while (!feof($h)) { // read the whole file 
        $name = trim(fgets($h)); // read a user name from the file 
        if ($name == $username) { // check if the names match
            $found = True;
            break;
        }
    }
    fclose($h);
    return $found;
}


// delete a file from the user file list 
function delete_file($filename, $user_file_path) {
    $deleted_list = ""; // string to store the updated list  
    $h = fopen($user_file_path, "r"); 
    while (!feof($h)) {
        $line = trim(fgets($h)); 
        $identifier = substr($line, 0, 1);
    
        if ($identifier=='*' || $identifier=='#') { // is username or sharer
            $deleted_list .= $line."\n";
        }
        else if ($identifier=='^') { // is filename
            $name = substr($line, 1, null);
            if ($name != $filename) {
                $deleted_list .= $line."\n";
            }
        } else if ($identifier=='~') { // is shared file
            $name = explode(";", substr($line, 1, null))[0]; // extract filename 
            if ($name != $filename) { // see if the file should be deleted 
                $deleted_list .= $line."\n";
            }
        }
    }
    fclose($h);
    return $deleted_list;
}


// remove a specific sharer from a recipient 
function delete_sharer($filename, $user_file_path, $recipient) {
    $deleted_list = "";
    $h = fopen($user_file_path, "r");
    while (!feof($h)) {
        $line = trim(fgets($h));
        $identifier = substr($line, 0, 1);
    
        if ($identifier=='#') { // is sharer
            $name = explode(";", substr($line, 1, null))[0]; // extract file name 
            $cur_recipient = explode(";", substr($line, 1, null))[1]; // extract recipient name 
            if ($name != $filename || $cur_recipient != $recipient) { // determine whether to delete or keep 
                $deleted_list .= $line."\n";
            }
        }
        // is username or filename or shared file
        else if ($identifier=='*' || $identifier=='^' || $identifier=='~') {
            $deleted_list .= $line."\n"; // keep the rest of the lines 
        }
    }
    fclose($h);
    return $deleted_list;
}


// delete a user account from the user list 
function delete_account($username, $user_list_path) {
    $deleted_list = ""; // for storing the updated user list 
    $h = fopen($user_list_path, "r"); 
    while (!feof($h)) {
        $name = trim(fgets($h)); // read user name 
        if ($name != $username) { // determine if the name should be kept or deleted 
            $deleted_list .= $name."\n";
        }
    }
    fclose($h);
    return $deleted_list; // return updated user list 
}

?>