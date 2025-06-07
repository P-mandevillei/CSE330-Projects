<!--
This is the user's homepage.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!--
    TinyMCE rich text editor: https://www.tiny.cloud/my-account/integrate/#html
    -->
    <script src="https://cdn.tiny.cloud/1/jd7g63smpi442awsy04olzgf3q3zhymgyhdgr7rrr9yk8ir4/tinymce/7/tinymce.min.js" referrerpolicy="origin"></script>
    
    <title>The Ultimate News Viewer</title>
    <link rel="stylesheet" type="text/css" href="homepageStyle.css">
</head>
<body>

<?php
require_once 'homepageHelper.php';
require_once 'dataBase.php';

// Creates the session.
session_start();
$username = false;
initialize_session($username);
$_SESSION['last_visit'] = $_SESSION['now'];
$_SESSION['now'] = 'homepage';
?>

<div id="welcome">Welcome to the <br> Ultimate News Viewer<?php if ($_SESSION['signin_newsViewer']) {echo ",<br>".htmlentities($username);} ?>!</div>

<?php

// If user is not signed in: display sign in button
if (!$_SESSION['signin_newsViewer']) {
    echo "<div id='signin_button'>\n";
    echo "<form action='login.php'>\n";
    echo "\t<input type='submit' value='Sign In'>\n";
    echo "</form>\n";
    echo "</div>\n";
}

// If user is signed in: display signout and post button
else {

    // post story button
    echo "<div id='post_button'>\n";
    echo "<form action='postHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s' >\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='story'>\n";
    echo "\t<input type='text' name='title' placeholder='Title (Within 255 Characters)'>\n";
        // https://www.tiny.cloud/my-account/integrate/#html
    echo "\t<textarea class='tinymce' name='body'> Write Your Story Here! </textarea>\n"; 
    echo "\t<input type='url' name='link' placeholder='Optional link to original article'>\n";
    echo "\t<input type='submit' value='Post Story'>\n";
    echo "</form>\n";
    echo "</div>\n";

    // signout button
    echo "<div id='signout_button'>\n";
    echo "<form action='userHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s' >\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='signout'>\n";
    echo "\t<input type='submit' value='Sign Out'>\n";
    echo "</form>\n";
    echo "</div>\n";

    // search other users button
    echo "<div id='search_button'>\n";
    echo "<form action='viewProfile.php' method='GET'>\n";
    echo "\t<input type='text' name='username' placeholder='username'>\n";
    echo "\t<input type='submit' value='See Profile'>\n";
    echo "</form>\n";
    echo "</div>\n";
}

display_post_titles($mysqli);

?>

<!--
https://www.tiny.cloud/my-account/integrate/#html
-->
<script>
tinymce.init({
    selector: '.tinymce'
    });
</script>

</body>
</html>