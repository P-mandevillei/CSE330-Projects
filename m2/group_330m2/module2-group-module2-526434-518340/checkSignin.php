<?php
/*
Includes the checkSignin function.
Checks whether the user is signed in, and deny their access if they're not.
*/

function checkSignin() {
    session_start();
    // Check: User must enter from the signin page!
    if (!isset($_SESSION) or $_SESSION['signin'] != 'SUCCESS') { 
        $_SESSION = array();
        session_destroy();
        header("Location: fileSharer.php");
        exit;
    }
}

?>