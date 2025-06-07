<?php
/*
Helper functions to generate return buttons to respective locations,
And monitor if the buttons are hit.
*/

function returnIfNeeded() {

    if ($_GET['return']=='signin') {
        session_start();
        $_SESSION = array(); // Clean up the session array
        session_destroy();
        header("Location: fileSharer.php");
        exit;
    }

    if ($_GET['return']=='homepage') {
        header("Location: userHome.php");
        exit;
    }
}

function returnToSignInButton() {
    // Generates a button that redirects the user to the sign in page
    // The form is self-submitted
    echo "<div id='return_signin'>\n";
    echo "<form class='return' id='name_input_signin' method='GET'>\n";
    echo "\t<input type='hidden' name='return' value='signin'>\n";
    echo "\t<input type='submit' value='Return To Signin Page'>\n";
    echo "</form>\n";
    echo "</div>";
}

function returnToHomepageButton() {
    // Generates a button that redirects the user to their homepage
    // The form is self-submitted
    echo "<div id='return_homepage'>\n";
    echo "<form class='return' id='name_input_homepage' method='GET'>\n";
    echo "\t<input type='hidden' name='return' value='homepage'>\n";
    echo "\t<input type='submit' value='Return To Homepage'>\n";
    echo "</form>\n";
    echo "</div>";
}

function signOutButton() {
    // Generates a button that redirects the user to the sign in page
    // The form is self-submitted
    echo "<form class='return' id='name_input_signout' method='GET'>\n";
    echo "\t<input type='hidden' name='return' value='signin'>\n";
    echo "\t<input type='submit' value='Sign Out'>\n";
    echo "</form>\n";
}

?>