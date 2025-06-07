<?php
/*
Handles story and comment post requests.
*/

require_once 'paths.php';
require_once 'validator.php';
require_once 'dataBase.php';
require_once 'homepageHelper.php';

session_start();
$username = false;
initialize_session($username);
$_SESSION['last_visit'] = $_SESSION['now'];
$_SESSION['now'] = 'postHandler';

// Redirect not signed in users
if (!isset($_SESSION['signin_newsViewer']) || !$_SESSION['signin_newsViewer']) {
    header('Location: homepage.php');
    exit;
}

check_username($username);

// Check token
$token = $_POST['token'];
if ($token != $_SESSION['token']) {
    $_SESSION['type'] = 'invalid_token';
    header("Location: actionResponse.php");
    exit;
}

$type = $_POST['type'];
// post new story
if ($type == 'story') {

    // Check: title and body cannot be empty!
    if (!isset($_POST['title']) || strlen($_POST['title'])==0 
        || !isset($_POST['body']) || strlen($_POST['body'])==0) {
            $_SESSION['type'] = 'invalid_post_content';
            header('Location: actionResponse.php');
            exit;
    }

    $title = $_POST['title'];
    $body = $_POST['body'];
    $link = "";
    if (isset($_POST['link'])) {
        $link = $_POST['link'];
    }
    
    // Check: ensure our database could store these values
    check_username($username);
    check_title_length($title);
    check_link($link);

    // Insert entry
    $stmt = $mysqli->prepare("insert into stories (poster, title, body, link) values (?, ?, ?, ?)");
    check_statement($stmt, $mysqli);
    // Although body is stored as blob in the table, here it is posted as a text string,
    // So I used type 's' in bind_param
    $stmt->bind_param("ssss", $username, $title, $body, $link);
    execute_stmt($stmt, $mysqli);

    // Success: redirect
    $_SESSION['type'] = 'post_success';
    header("Location: actionResponse.php");
    exit;
    
}
// delete story
else if ($type == 'delete_story') {

    $id = $_POST['id'];

    // Check unique post and user match
    check_post_id_and_poster($id, $username, $mysqli);

    // first delete all associated replies
    $stmt = $mysqli->prepare("delete from secondary_comments where story_id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $id);
    execute_stmt($stmt, $mysqli);

    // delete all associated comments
    $stmt = $mysqli->prepare("delete from comments where story_id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $id);
    execute_stmt($stmt, $mysqli);

    // delete entry
    $stmt = $mysqli->prepare("delete from stories where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $id);
    execute_stmt($stmt, $mysqli);

    // success message
    $_SESSION['type'] = 'delete_post_success';
    header("Location: actionResponse.php");
    exit;

}
// edit story
else if ($type == "edit_story") {

    $id = $_POST['id'];

    // Check unique post and user match
    check_post_id_and_poster($id, $username, $mysqli);

    // Check: title and body cannot be empty!
    if (!isset($_POST['title']) || strlen($_POST['title'])==0 
        || !isset($_POST['body']) || strlen($_POST['body'])==0) {
            $_SESSION['type'] = 'invalid_post_content';
            header('Location: actionResponse.php');
            exit;
    }

    $title = $_POST['title'];
    $body = $_POST['body'];
    $link = "";
    if (isset($_POST['link'])) {
        $link = $_POST['link'];
    }
    
    // Check: ensure our database could store these values
    check_username($username);
    check_title_length($title);
    check_link($link);

    // Update entry
    $stmt = $mysqli->prepare("update stories set title=?, body=?, link=?, post_time=current_timestamp() where id=? and poster=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("sssis", $title, $body, $link, $id, $username);
    execute_stmt($stmt, $mysqli);

    // Success: redirect
    $_SESSION['type'] = 'edit_success';
    header("Location: actionResponse.php");
    exit;

}
// Leave comment
else if ($type == 'comment') {

    $id = $_POST['id'];

    // Check unique post
    check_post_id($id, $mysqli);

    // Check: content cannot be empty!
    if (!isset($_POST['content']) || strlen($_POST['content'])==0) {
        $_SESSION['type'] = 'invalid_post_content';
        header('Location: actionResponse.php');
        exit;
    }

    // insert entry
    $content = $_POST['content'];
    $stmt = $mysqli->prepare("insert into comments (story_id, poster, content) values (?, ?, ?)");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("iss", $id, $username, $content);
    execute_stmt($stmt, $mysqli);

    // success message
    $_SESSION['type'] = 'leave_comment_success';
    $_SESSION['return_dest'] = sprintf("postViewer.php?id=%u", $id);
    header("Location: actionResponse.php");
    exit;

}
// edit comment
else if ($type == 'edit_comment') {

    $comment_id = $_POST['comment_id'];
    $story_id = $_POST['story_id'];
    
    // Check unique comment and username match
    check_comment_id_and_poster($comment_id, $username, $mysqli);

    // Check: content cannot be empty!
    if (!isset($_POST['content']) || strlen($_POST['content'])==0) {
        $_SESSION['type'] = 'invalid_post_content';
        header('Location: actionResponse.php');
        exit;
    }

    // update entry
    $content = $_POST['content'];
    $stmt = $mysqli->prepare("update comments set content=?, post_time=current_timestamp() where id=? and poster=? and story_id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("sisi", $content, $comment_id, $username, $story_id);
    execute_stmt($stmt, $mysqli);

    // success message
    $_SESSION['type'] = 'edit_comment_success';
    $_SESSION['return_dest'] = sprintf("postViewer.php?id=%u", $story_id);
    header("Location: actionResponse.php");
    exit;
    
}
// delete comment
else if ($type == 'delete_comment') {

    $comment_id = $_POST['comment_id'];
    $story_id = $_POST['story_id'];

    // Check unique comment and username match
    check_comment_id_and_poster($comment_id, $username, $mysqli);

    // First delete all associated replies
    $stmt = $mysqli->prepare("delete from secondary_comments where primary_comment_id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $comment_id);
    execute_stmt($stmt, $mysqli);

    // delete entry
    $stmt = $mysqli->prepare("delete from comments where id=? and poster=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("is", $comment_id, $username);
    execute_stmt($stmt, $mysqli);

    // success message
    $_SESSION['type'] = 'delete_comment_success';
    $_SESSION['return_dest'] = sprintf("postViewer.php?id=%u", $story_id);
    header("Location: actionResponse.php");
    exit;
}

// Leave secondary comment
else if ($type == 'reply_comment') {

    $primary_comment_id = $_POST['primary_comment_id'];
    $story_id = $_POST['story_id'];
    $recipient = $_POST['recipient'];
    check_post_id($story_id, $mysqli);
    check_comment_id($primary_comment_id, $mysqli);
    check_username($recipient);

    // Check: content cannot be empty!
    if (!isset($_POST['content']) || strlen($_POST['content'])==0) {
        $_SESSION['type'] = 'invalid_post_content';
        header('Location: actionResponse.php');
        exit;
    }

    // insert entry
    $content = $_POST['content'];
    $stmt = $mysqli->prepare("insert into secondary_comments (poster, content, primary_comment_id, story_id, recipient) values (?, ?, ?, ?, ?)");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("ssiis", $username, $content, $primary_comment_id, $story_id, $recipient);
    execute_stmt($stmt, $mysqli);

    // success message
    $_SESSION['type'] = 'reply_success';
    $_SESSION['return_dest'] = sprintf("postViewer.php?id=%u", $story_id);
    header("Location: actionResponse.php");
    exit;

}
// edit reply
else if ($type == 'edit_reply') {

    $reply_id = $_POST['reply_id'];
    $story_id = $_POST['story_id'];
    
    // Check unique reply and username match
    check_reply_id_and_poster($reply_id, $username, $mysqli);

    // Check: content cannot be empty!
    if (!isset($_POST['content']) || strlen($_POST['content'])==0) {
        $_SESSION['type'] = 'invalid_post_content';
        header('Location: actionResponse.php');
        exit;
    }

    // update entry
    $content = $_POST['content'];
    $stmt = $mysqli->prepare("update secondary_comments set content=?, post_time=current_timestamp() where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("si", $content, $reply_id);
    execute_stmt($stmt, $mysqli);

    // success message
    $_SESSION['type'] = 'edit_reply_success';
    $_SESSION['return_dest'] = sprintf("postViewer.php?id=%u", $story_id);
    header("Location: actionResponse.php");
    exit;
    
}

// delete reply
else if ($type == 'delete_reply') {

    $reply_id = $_POST['reply_id'];
    $story_id = $_POST['story_id'];
    
    // Check unique reply and username match
    check_reply_id_and_poster($reply_id, $username, $mysqli);

    // delete entry
    $stmt = $mysqli->prepare("delete from secondary_comments where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $reply_id);
    execute_stmt($stmt, $mysqli);

    // success message
    $_SESSION['type'] = 'delete_reply_success';
    $_SESSION['return_dest'] = sprintf("postViewer.php?id=%u", $story_id);
    header("Location: actionResponse.php");
    exit;
}
?>