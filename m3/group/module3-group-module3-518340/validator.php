<?php
/*
This helper file contains functions used for checking input or checking the existence of usernames, etc.
*/

require_once 'paths.php';
require_once $HTML_PURIFIER_PATH; // Load HTML Purifier:  http://htmlpurifier.org/docs
require_once 'homepageHelper.php';

function clean_html($text_blob) {
    /*
    Excapes output for html formatted text blobs.
    Referenced from http://htmlpurifier.org/docs with inputs from ChatGPT
    */
    $config = HTMLPurifier_Config::createDefault();

    // Allow <img> tags
    $config->set('HTML.Allowed', 'p,br,b,strong,i,em,u,a[href],img[src|alt|width|height]');
    $config->set('URI.AllowedSchemes', ['data' => true]); // Only allow data URIs
    $config->set('HTML.SafeIframe', false); // Ensure iframes are not allowed
    // Allow inline CSS styles
    $config->set('CSS.AllowedProperties', ['text-align', 'color', 'background-color', 'font-size', 'font-weight']);
    $config->set('HTML.AllowedAttributes', ['style', 'src']);

    $purifier = new HTMLPurifier($config);
    $clean_html = $purifier->purify($text_blob);
    return $clean_html;
}

function check_statement($stmt, $mysqli) {
    /*
    Checks if the mysqli statement is preped.
    If it fails, redirects to actionResponse.php
    */
    if (!$stmt) {
        $_SESSION['type'] = 'mysqli_prep_error';
        $_SESSION['error'] = $mysqli->error;
        header("Location: actionResponse.php");
        exit;
    }
}

function execute_stmt($stmt, $mysqli) {
    /*
    Redirects user if MySQL execution fails.
    */
    if (!$stmt->execute()) {
        $_SESSION['type'] = 'mysqli_exe_error';
        $_SESSION['error'] = $mysqli->error;
        header("Location: actionResponse.php");
        exit;
    }
}

function check_username($username) {
    /*
    Allows only usernames <= 12 characters with certain characters.
    Otherwise redirects.
    */
    if ($username==false || !preg_match('/^[\w_\-]+$/', $username) || strlen($username)>12) {
        $_SESSION['type'] = 'invalid_username';
        header('Location: actionResponse.php');
        exit;
    }
}

function check_user($username, $mysqli) {
    /*
    Checks if the given user already exists.
    Returns the number of users with the same username in the database.
    */
    $stmt = $mysqli->prepare("select count(*) from users where username=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $return_count = -1;
    $stmt->bind_result($return_count);
    $stmt->fetch();
    $stmt->close();
    return $return_count;
}

function check_user_password($username, $password, $mysqli) {
    /*
    Checks if a given user has the correct password.
    Returns True if the username and password match.
    Returns False otherwise.
    */
    $stmt = $mysqli->prepare("select count(*), password from users where username=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $return_count = -1;
    $return_password = "";
    $stmt->bind_result($return_count, $return_password);
    $stmt->fetch();
    // If the user is unique and has the right password
    if ($return_count==1 && password_verify($password, $return_password)) {
        $stmt->close();
        return true;
    } else { // Wrong password
        $stmt->close();
        return false;
    }
}

function check_title_length($title) {
    // Since we store title as tinytext,
    // It must be within 255 characters
    if (strlen($title)>255) {
        $_SESSION['type'] = 'invalid_title';
        header("Location: actionResponse.php");
        exit;
    }
}

function check_link($link) {
    // Check if the link is valid and within 65535 characters long
    // https://stackoverflow.com/questions/2058578/best-way-to-check-if-a-url-is-valid
    if (strlen($link)>65535 || 
        ($link!="" && !filter_var($link, FILTER_VALIDATE_URL))) {
        $_SESSION['type'] = 'invalid_link';
        header("Location: actionResponse.php");
        exit;
    }
}

function check_post_id_and_poster($id, $username, $mysqli) {
    // Check unique post and user match
    $post_username = get_post_username($id, $mysqli);
    if (!$post_username) {
        $_SESSION['type'] = 'view_post_not_unique';
        header("Location: actionResponse.php");
        exit;
    }
    if ($username != $post_username) {
        $_SESSION['type'] = 'edit_post_user_invalid';
        header("Location: actionResponse.php");
        exit;
    }
}

function check_post_id($id, $mysqli) {
    // Check unique post
    $post_username = get_post_username($id, $mysqli);
    if (!$post_username) {
        $_SESSION['type'] = 'view_post_not_unique';
        header("Location: actionResponse.php");
        exit;
    }
}

function check_comment_id($id, $mysqli) {
    // Check unique comment
    $comment_username = get_comment_username($id, $mysqli);
    if (!$comment_username) {
        $_SESSION['type'] = 'comment_not_unique';
        header("Location: actionResponse.php");
        exit;
    }
}

function check_comment_id_and_poster($id, $username, $mysqli) {
    // Check unique comment and user match
    $comment_username = get_comment_username($id, $mysqli);
    if (!$comment_username) {
        $_SESSION['type'] = 'comment_not_unique';
        header("Location: actionResponse.php");
        exit;
    }
    if ($username != $comment_username) {
        $_SESSION['type'] = 'edit_comment_user_invalid';
        header("Location: actionResponse.php");
        exit;
    }
}

function check_reply_id_and_poster($id, $username, $mysqli) {
    // Check unique comment and user match
    $reply_username = get_reply_poster($id, $mysqli);
    if (!$reply_username) {
        $_SESSION['type'] = 'reply_not_unique';
        header("Location: actionResponse.php");
        exit;
    }
    if ($username != $reply_username) {
        $_SESSION['type'] = 'edit_reply_user_invalid';
        header("Location: actionResponse.php");
        exit;
    }
}

?>