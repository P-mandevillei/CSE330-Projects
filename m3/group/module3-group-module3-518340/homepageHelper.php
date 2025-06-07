<?php
/*
Helper page for homepage.php
*/
require_once 'validator.php';

function initialize_session(&$username) {
    // initialize the session array if the session has not been created
    if (!isset($_SESSION['signin_newsViewer'])) {
        
        // keep record of last visit
        $last_visit = "";
        if (isset($_SESSION['last_visit'])) {
            $last_visit = $_SESSION['last_visit'];
        }
        $now = "";
        if (isset($_SESSION['now'])) {
            $now = $_SESSION['now'];
        }
        $_SESSION = array(); // Initialization
        $_SESSION['last_visit'] = $last_visit;
        $_SESSION['now'] = $now;
        
        $_SESSION['signin_newsViewer'] = false; // Keep track of if the user is signed in
        $_SESSION['token'] = bin2hex(random_bytes(32)); // Session token for CSRF
        $_SESSION['type'] = ""; // Initialization for actionResponse
        $username = false;
    } 

    else if ($_SESSION['signin_newsViewer']) { // if signed in
        $username = $_SESSION['username'];
    } 

    else { // not signed in
        $username = false;
    }
}

function display_post_titles($mysqli) {
    $stmt = $mysqli->prepare("select id, views, poster, title, post_time from stories order by views DESC, post_time DESC");
    check_statement($stmt, $mysqli);
    execute_stmt($stmt, $mysqli);

    $return_views = 0;
    $return_id = 0;
    $return_poster = "";
    $return_title = "";
    $return_post_time = "";
    $stmt->bind_result($return_id, $return_views, $return_poster, $return_title, $return_post_time);

    while ($stmt->fetch()) {
        echo "<div class='post_block'>\n";
        printf("\t<p class='title'><a href='postViewer.php?id=%u'> %s </a></p>\n", 
    htmlentities($return_id),
            htmlentities($return_title)
        );
        printf("\t<p class='post_info'> %s on %s; %u views </p>\n", 
        htmlentities($return_poster),
                htmlentities($return_post_time),
                $return_views
            );     
        echo "</div>\n";
        echo "<br>\n";
    }
}

function display_post($id, $mysqli) {
    $stmt = $mysqli->prepare("select count(*), poster, title, body, link, post_time, views from stories where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_poster = "";
    $return_title = "";
    $return_body = "";
    $return_link = "";
    $return_post_time = "";
    $return_views = 0;
    $stmt->bind_result($return_count, $return_poster, $return_title, $return_body, $return_link, $return_post_time, $return_views);
    $stmt->fetch();
    $stmt->close();
    // if the result is not unique: display error
    if ($return_count != 1) {
        $_SESSION['type'] = 'view_post_not_unique';
        header("Location: actionResponse.php");
        exit;
    }

    // if link is not given: direct to the current page again
    if ($return_link == "") {
        $return_link = sprintf("postViewer.php?id=%u", $id);
    }

    echo "<div>\n";
    printf("<h1 id='title'> %s </h1>", htmlentities($return_title));
    printf("\t<p id='post_info'> %s on %s; %u views </p>\n", 
    htmlentities($return_poster),
            htmlentities($return_post_time),
            $return_views
        );
    printf("<div id='body'> %s </div>", clean_html($return_body));
    printf("<p id='link'><a href='%s'> Read Source </a></p>", htmlentities($return_link));
    echo "</div>\n";

}

function display_comments($story_id, $username, $signin, $mysqli, $mysqli2) {
    // Displays all comments
    $stmt = $mysqli->prepare("select id, poster, post_time, content from comments where story_id=? order by post_time DESC");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $story_id);
    execute_stmt($stmt, $mysqli);

    $return_id = 0;
    $return_poster = "";
    $return_post_time = "";
    $return_content = "";
    $stmt->bind_result($return_id, $return_poster, $return_post_time, $return_content);

    while ($stmt->fetch()) {
        echo "<div class='comment'>\n";
        printf("\t<div class='comment_content'> %s </div>\n", clean_html($return_content));
        printf("\t<p class='comment_signature'> %s on %s </p>\n", 
        htmlentities($return_poster),
                htmlentities($return_post_time)
            );
        // if current user is poster: button to edit
        if ($username == $return_poster) {
            // edit button
            echo "<form action='edit.php' method='POST'>\n";
            printf("<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
            echo "<input type='hidden' name='type' value='edit_comment'>\n";
            printf("<input type='hidden' name='comment_id' value='%u'>\n", $return_id);
            printf("<input type='hidden' name='story_id' value='%u'>\n", $story_id);
            echo "<input type='submit' value='edit'>\n";
            echo "</form>\n";
        }
        // if signed in: reply button
        if ($signin) {
            echo "<form action='reply.php' method='POST'>\n";
            printf("<input type='hidden' name='primary_comment_id' value='%u'>\n", $return_id);
            printf("<input type='hidden' name='story_id' value='%u'>\n", $story_id);
            printf("<input type='hidden' name='recipient' value='%s'>\n", htmlentities($return_poster));
            echo "<input type='submit' value='reply'>\n";
            echo "</form>\n";
        }
        echo "</div>\n";
        echo "<br>\n";

        display_secondary_comments($return_id, $username, $signin, $mysqli2);
    }
}

function display_secondary_comments($primary_comment_id, $username, $signin, $mysqli) {
    // Displays all replies
    $stmt = $mysqli->prepare("select id, poster, post_time, content, story_id, recipient from secondary_comments where primary_comment_id=? order by post_time DESC");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $primary_comment_id);
    execute_stmt($stmt, $mysqli);

    $return_id = 0;
    $return_poster = "";
    $return_post_time = "";
    $return_content = "";
    $return_story_id = 0;
    $return_recipient = "";
    $stmt->bind_result($return_id, $return_poster, $return_post_time, $return_content, $return_story_id, $return_recipient);

    while ($stmt->fetch()) {
        echo "<div class='reply'>\n";
        printf("\t<div class='comment_content'> %s </div>\n", clean_html($return_content));
        printf("\t<p class='comment_signature'> %s replied to %s on %s </p>\n", 
        htmlentities($return_poster),
                htmlentities($return_recipient),
                htmlentities($return_post_time)
            );
        // if current user is poster: button to edit
        if ($username == $return_poster) {
            // edit button
            
            echo "<form action='edit.php' method='POST'>\n";
            printf("<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
            echo "<input type='hidden' name='type' value='edit_reply'>\n";
            
            printf("<input type='hidden' name='reply_id' value='%u'>\n", $return_id);
            printf("<input type='hidden' name='story_id' value='%u'>\n", $return_story_id);
            printf("<input type='hidden' name='poster' value='%s'>\n", htmlentities($username));

            echo "<input type='submit' value='edit'>\n";
            echo "</form>\n";
            
        }
        // if signed in: reply button
        if ($signin) {
            echo "<form action='reply.php' method='POST'>\n";
            printf("<input type='hidden' name='primary_comment_id' value='%u'>\n", $primary_comment_id);
            printf("<input type='hidden' name='story_id' value='%u'>\n", $return_story_id);
            printf("<input type='hidden' name='recipient' value='%s'>\n", htmlentities($return_poster));
            echo "<input type='submit' value='reply'>\n";
            echo "</form>\n";
        }

        echo "</div>\n";
        echo "<br>\n";
    }
}

function display_comment($comment_id, $mysqli) {
    // Displays only the comment with id=comment_id
    $stmt = $mysqli->prepare("select id, poster, post_time, content from comments where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $comment_id);
    execute_stmt($stmt, $mysqli);

    $return_id = 0;
    $return_poster = "";
    $return_post_time = "";
    $return_content = "";
    $stmt->bind_result($return_id, $return_poster, $return_post_time, $return_content);
    $stmt->fetch();
    $stmt->close();

    echo "<div class='comment'>\n";
    printf("\t<div class='comment_content'> %s </div>\n", clean_html($return_content));
    printf("\t<p class='comment_signature'> %s on %s </p>\n", 
    htmlentities($return_poster),
            htmlentities($return_post_time)
    );
    echo "</div>\n";

    // Displays all replies associated with this comment
    $stmt = $mysqli->prepare("select id, poster, post_time, content, story_id, recipient from secondary_comments where primary_comment_id=? order by post_time DESC");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $comment_id);
    execute_stmt($stmt, $mysqli);

    $return_id = 0;
    $return_poster = "";
    $return_post_time = "";
    $return_content = "";
    $return_story_id = 0;
    $return_recipient = "";
    $stmt->bind_result($return_id, $return_poster, $return_post_time, $return_content, $return_story_id, $return_recipient);

    while ($stmt->fetch()) {
        echo "<div class='reply'>\n";
        printf("\t<div class='comment_content'> %s </div>\n", clean_html($return_content));
        printf("\t<p class='comment_signature'> %s replied to %s on %s </p>\n", 
        htmlentities($return_poster),
                htmlentities($return_recipient),
                htmlentities($return_post_time)
            );
        echo "</div>\n";
        echo "<br>\n";
    }
    
}

function get_post_username($post_id, $mysqli) {
    /*
    Gets the username of the post with the id post_id.
    Returns the username if the post is found; returns false otherwise.
    */

    $stmt = $mysqli->prepare("select count(*), poster from stories where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $post_id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_poster = "";
    $stmt->bind_result($return_count, $return_poster);
    $stmt->fetch();
    
    // if the result is not unique: return false
    if ($return_count != 1) {
        return false;
    }
    
    return $return_poster;
}

function get_comment_username($comment_id, $mysqli) {
    /*
    Gets the username of the post with the id post_id.
    Returns the username if the post is found; returns false otherwise.
    */

    $stmt = $mysqli->prepare("select count(*), poster from comments where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $comment_id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_poster = "";
    $stmt->bind_result($return_count, $return_poster);
    $stmt->fetch();
    
    // if the result is not unique: return false
    if ($return_count != 1) {
        return false;
    }
    
    return $return_poster;
}

function get_reply_poster($reply_id, $mysqli) {
    /*
    Gets the username of the post with the id post_id.
    Returns the username if the post is found; returns false otherwise.
    */

    $stmt = $mysqli->prepare("select count(*), poster from secondary_comments where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $reply_id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_poster = "";
    $stmt->bind_result($return_count, $return_poster);
    $stmt->fetch();
    
    // if the result is not unique: return false
    if ($return_count != 1) {
        return false;
    }
    
    return $return_poster;
}

function increment_views($story_id, $mysqli) {

    // Make sure the post is unique
    check_post_id($story_id, $mysqli);

    // Get the current views
    $stmt = $mysqli->prepare("select count(*), views from stories where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $story_id);
    execute_stmt($stmt, $mysqli);

    $return_count = 0;
    $return_views = 0;
    $stmt->bind_result($return_count, $return_views);
    $stmt->fetch();

    // if the result is not unique: display error
    if ($return_count != 1) {
        $_SESSION['type'] = 'view_post_not_unique';
        header("Location: actionResponse.php");
        exit;
    }
    $stmt->close();

    $updated_views = $return_views + 1;
    // update views
    $stmt = $mysqli->prepare("update stories set views=? where id=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("ii", $updated_views, $story_id);
    execute_stmt($stmt, $mysqli);

    // No need for success message

}

?>