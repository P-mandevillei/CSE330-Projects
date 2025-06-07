<!--
Reply to comments page
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
    <title>Reply</title>
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
$_SESSION['now'] = 'reply';

check_username($username);
$token = $_SESSION['token'];

// if ID is not passed: terminate and display return button.
if (!isset($_POST['primary_comment_id']) || !is_numeric($_POST['primary_comment_id']) || !($_POST['primary_comment_id']>=0)
    || !isset($_POST['story_id']) || !is_numeric($_POST['story_id']) || !($_POST['story_id']>=0)
    || !isset($_POST['recipient'])) {
    echo "\t<div id='body'>You have arrived at an uncharted territory.</div>\n";
    echo "\t<a href='homepage.php'> Return </a>\n";
    echo "</body>\n";
    echo "</html>\n";
    exit;
}

// Make sure the post and comment are both unique, and the recipient's username is valid
$primary_comment_id = $_POST['primary_comment_id'];
$story_id = $_POST['story_id'];
$recipient = $_POST['recipient'];
check_post_id($story_id, $mysqli);
check_comment_id($primary_comment_id, $mysqli);
check_username($recipient);

// Display the comment to be replied
display_comment($primary_comment_id, $mysqli);

// Reply button
echo "<form action='postHandler.php' method='POST'>\n";
printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
echo "\t<input type='hidden' name='type' value='reply_comment'>\n";
    // https://www.tiny.cloud/my-account/integrate/#html
printf("\t<textarea class='tinymce' name='content'> Reply to %s </textarea>\n", htmlentities($recipient)); 

printf("<input type='hidden' name='primary_comment_id' value='%u'>\n", $primary_comment_id);
printf("<input type='hidden' name='story_id' value='%u'>\n", $story_id);
printf("<input type='hidden' name='recipient' value='%s'>\n", htmlentities($recipient));

echo "\t<input type='submit' value='Reply!'>\n";
echo "</form>\n";

printf("<a href='postViewer.php?id=%u'> Return </a>", $story_id);
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