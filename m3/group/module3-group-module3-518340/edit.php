<!--
The page to edit stories.
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

    <title>Edit</title>
    <link rel="stylesheet" type="text/css" href="editStyle.css">
</head>
<body>

<?php
require_once 'paths.php';
require_once 'validator.php';
require_once 'dataBase.php';
require_once 'homepageHelper.php';

session_start();
// initialize session
$username = false;
initialize_session($username);
$_SESSION['last_visit'] = $_SESSION['now'];
$_SESSION['now'] = 'edit';

// Redirect not signed in users
if (!isset($_SESSION['signin_newsViewer']) || !$_SESSION['signin_newsViewer']) {
    header('Location: homepage.php');
    exit;
}

check_username($username);

// Check token
if (isset($_POST['token'])) {
    $token = $_POST['token'];
} else {
    $token = '';
}
if ($token != $_SESSION['token']) {
    $_SESSION['type'] = 'invalid_token';
    header("Location: actionResponse.php");
    exit;
}

if (isset($_POST['type'])) {
    $type = $_POST['type'];
} else {
    $type = '';
}

// edit story
if ($type == 'edit_story') {

    $id = $_POST['id'];

    // Check unique post and user match
    check_post_id_and_poster($id, $username, $mysqli);

    // Get content of the post
    $stmt = $mysqli->prepare("select count(*), poster, title, body, link from stories where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_poster = "";
    $return_title = "";
    $return_body = "";
    $return_link = "";
    $stmt->bind_result($return_count, $return_poster, $return_title, $return_body, $return_link);
    $stmt->fetch();
    
    // if the result is not unique: display error
    if ($return_count != 1) {
        $_SESSION['type'] = 'view_post_not_unique';
        header("Location: actionResponse.php");
        exit;
    }

    // message
    echo "<div class='edit_msg'>\n";
    echo "Edit Your Story\n";
    echo "</div>\n";

    // edit button
    echo "<div id='post_button'>\n";
    echo "<form action='postHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='edit_story'>\n";
    printf("\t<input type='hidden' name='id' value='%s'>\n", $id);
    printf("\t<input type='text' name='title' value='%s'>\n", htmlentities($return_title));
        // https://www.tiny.cloud/my-account/integrate/#html
    printf("\t<textarea class='tinymce' name='body'> %s </textarea>\n", clean_html($return_body)); 
    printf("\t<input type='url' name='link' value='%s'>\n", htmlentities($return_link));
    echo "\t<input type='submit' value='Edit Story'>\n";
    echo "</form>\n";
    echo "</div>\n";

}

// edit comment
else if ($type=='edit_comment') {

    $comment_id = $_POST['comment_id'];
    $story_id = $_POST['story_id'];
    // Check unique comment and user match
    check_comment_id_and_poster($comment_id, $username, $mysqli);

    // Get comment content
    $stmt = $mysqli->prepare("select count(*), content from comments where id=? and poster=? and story_id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("isi", $comment_id, $username, $story_id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_content = "";
    $stmt->bind_result($return_count, $return_content);
    $stmt->fetch();

    // if the result is not unique: display error
    if ($return_count != 1) {
        $_SESSION['type'] = 'comment_not_unique';
        header("Location: actionResponse.php");
        exit;
    }

    // message
    echo "<div class='edit_msg'>\n";
    echo "Edit Your Comment\n";
    echo "</div>\n";

    echo "<div>\n";
    // edit button
    echo "<form action='postHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='edit_comment'>\n";
        // https://www.tiny.cloud/my-account/integrate/#html
    printf("\t<textarea class='tinymce' name='content'>%s</textarea>\n",
            clean_html($return_content)
        ); 
    printf("\t<input type='hidden' name='comment_id' value=%u>\n", $comment_id);
    printf("\t<input type='hidden' name='story_id' value=%u>\n", $story_id);
    echo "\t<input type='submit' value='Edit'>\n";
    echo "</form>\n";

    // delete button
    echo "<form action='postHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='delete_comment'>\n";
    printf("\t<input type='hidden' name='comment_id' value='%u'>\n", $comment_id);
    printf("\t<input type='hidden' name='story_id' value=%u>\n", $story_id);
    echo "\t<input type='submit' value='Delete Comment'>\n";
    echo "</form>\n";

    echo "</div>\n";
    
}

// edit reply
else if ($type == 'edit_reply') {

    $reply_id = $_POST['reply_id'];
    $story_id = $_POST['story_id'];
    // Check unique reply and user match
    check_reply_id_and_poster($reply_id, $username, $mysqli);

    // Get reply content
    $stmt = $mysqli->prepare("select count(*), content from secondary_comments where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $reply_id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_content = "";
    $stmt->bind_result($return_count, $return_content);
    $stmt->fetch();

    // if the result is not unique: display error
    if ($return_count != 1) {
        $_SESSION['type'] = 'reply_not_unique';
        header("Location: actionResponse.php");
        exit;
    }

    // message
    echo "<div class='edit_msg'>\n";
    echo "Edit Your Reply\n";
    echo "</div>\n";

    echo "<div>\n";
    // edit button
    echo "<form action='postHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='edit_reply'>\n";
        // https://www.tiny.cloud/my-account/integrate/#html
    printf("\t<textarea class='tinymce' name='content'>%s</textarea>\n",
            clean_html($return_content)
        ); 
    printf("\t<input type='hidden' name='reply_id' value=%u>\n", $reply_id);
    printf("\t<input type='hidden' name='story_id' value=%u>\n", $story_id);
    echo "\t<input type='submit' value='Edit'>\n";
    echo "</form>\n";

    // delete button
    echo "<form action='postHandler.php' method='POST'>\n";
    printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
    echo "\t<input type='hidden' name='type' value='delete_reply'>\n";
    printf("\t<input type='hidden' name='reply_id' value='%u'>\n", $reply_id);
    printf("\t<input type='hidden' name='story_id' value=%u>\n", $story_id);
    echo "\t<input type='submit' value='Delete Reply'>\n";
    echo "</form>\n";

    echo "</div>\n";
    
}

// Catch illegal arrivals
else {
    header('Location: homepage.php');
    exit;
}

?>
    
<a href="homepage.php"> Return to Homepage</a>

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