<!--
Page for viewing posts.
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
    
    <link rel="stylesheet" type="text/css" href="postViewerStyle.css">
    <title>Viewer</title>
</head>
<body>
    
<?php
require_once 'validator.php';
require_once 'dataBase.php';
require_once 'homepageHelper.php';

session_start();
$username = false;
initialize_session($username);
$_SESSION['last_visit'] = $_SESSION['now'];
$_SESSION['now'] = 'postViewer';

if ($username) {
    check_username($username);
}

$token = $_SESSION['token'];

// if ID is not passed: terminate and display return button.
if (!isset($_GET['id']) || !is_numeric($_GET['id']) || !($_GET['id']>=0)) {
    echo "\t<div id='body'> You have arrived at an uncharted territory. </div>\n";
    echo "\t<a href='homepage.php'> Return </a>\n";
    echo "</body>\n";
    echo "</html>\n";
    exit;
}

$id = $_GET['id'];

// Increment the views for the post
// It counts as a "view" only if the user arrived by clicking on the title on the homepage
if ($_SESSION['last_visit'] == 'homepage') {
    increment_views($id, $mysqli);
}

// Display the content
display_post($id, $mysqli);
echo "<br>\n";

// Display comment
display_comments($id, $username, $_SESSION['signin_newsViewer'], $mysqli, $mysqli2);

// If user is not signed in: display sign in button
if (!$_SESSION['signin_newsViewer']) {
    echo "<form action='login.php'>\n";
    echo "\t<input type='submit' value='Sign In'>\n";
    echo "</form>\n";
}

// If user is signed in: display edit, delete and comment button
else {
    $post_username = get_post_username($id, $mysqli);
    // If post is not found or is not unique: redirect
    if (!$post_username) {
        $_SESSION['type'] = 'view_post_not_unique';
        header("Location: actionResponse.php");
        exit;
    }

    // if the current user is the poster: display edit and delete
    if ($post_username == $username) {
        // edit
        echo "<form action='edit.php' method='POST'>\n";
        echo "\t<input type='hidden' name='token' value='$token'>\n";
        echo "\t<input type='hidden' name='type' value='edit_story'>\n";
        printf("\t<input type='hidden' name='id' value='%u'>\n", $id);
        echo "\t<input type='submit' value='Edit Post'>\n";
        echo "</form>\n";

        // delete
        echo "<form action='postHandler.php' method='POST'>\n";
        echo "\t<input type='hidden' name='token' value='$token'>\n";
        echo "\t<input type='hidden' name='type' value='delete_story'>\n";
        printf("\t<input type='hidden' name='id' value='%u'>\n", $id);
        echo "\t<input type='submit' value='Delete Post'>\n";
        echo "</form>\n";
    }

    // Comment button
    echo "<div id='post_area'>\n";
    echo "<form action='postHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s' >\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='comment'>\n";
        // https://www.tiny.cloud/my-account/integrate/#html
    echo "\t<textarea class='tinymce' name='content'> Thoughts, Comments, Questions? </textarea>\n"; 
    printf("\t<input type='hidden' name='id' value=%u>\n", $id);
    echo "\t<input type='submit' value='Leave Comment!'>\n";
    echo "</form>\n";
    echo "</div>\n";

}


?>

<a href="homepage.php"> Return to Homepage </a>

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