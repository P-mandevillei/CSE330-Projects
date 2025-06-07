<?php
/*
Helper methods for viewProfile.php
*/
require_once "validator.php";
function check_follow($follower, $followee, $mysqli) {
    $stmt = $mysqli->prepare("select count(*) from follows where follower_username=? and followee_username=?");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("ss", $follower, $followee);
    execute_stmt($stmt, $mysqli);

    $count = 0;
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    return $count == 1;
}

function display_profile($username, $mysqli) {

    // Display titles of stories posted by user
    echo "<div class='display_area'>\n";
    echo "<div class='split' id='left'>\n";
    echo "<p class='section'> Stories </p>\n";
    $stmt = $mysqli->prepare("select id, title, post_time from stories where poster=? order by post_time DESC");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("s", $username);
    execute_stmt($stmt, $mysqli);

    $return_id = 0;
    $return_title = "";
    $return_post_time = "";
    $stmt->bind_result($return_id, $return_title, $return_post_time);

    while ($stmt->fetch()) {
        echo "<div class='story'>\n";
        printf("\t<p class='title'><a href='postViewer.php?id=%u'> %s </a></p>\n", 
    htmlentities($return_id),
            htmlentities($return_title)
        );
        printf("\t<p class='post_info'> %s on %s</p>\n", 
        htmlentities($username),
                htmlentities($return_post_time)
            );
        echo "</div>\n";
        echo "<br>\n";
    } 
    echo "</div>\n";
    $stmt->close();

    echo "<div class='split' id='right'>\n";
    // Display comments posted by user
    echo "<div>\n";
    echo "<p class='section'> Comments </p>";
    $stmt = $mysqli->prepare("select story_id, post_time, content from comments where poster=? order by post_time DESC");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("i", $username);
    execute_stmt($stmt, $mysqli);

    $return_story_id = 0;
    $return_post_time = "";
    $return_content = "";
    $stmt->bind_result($return_story_id, $return_post_time, $return_content);

    while ($stmt->fetch()) {
        echo "<div class='comment'>\n";
        printf("\t<p class='comment_content'><a href='postViewer.php?id=%u'> %s </a></p>\n", 
            $return_story_id,
            htmlentities(strip_tags($return_content))
            );
        printf("\t<p class='comment_signature'> %s on %s </p>\n", 
        htmlentities($username),
                htmlentities($return_post_time)
            );
        echo "</div>\n";
        echo "<br>\n";
    }
    echo "</div><br><br>\n";
    $stmt->close();

    // Display replies by user
    echo "<div>\n";
    echo "<p class='section'> Replies </p>";
    $stmt = $mysqli->prepare("select post_time, content, story_id, recipient from secondary_comments where poster=? order by post_time DESC");
    check_statement($stmt, $mysqli);
    $stmt->bind_param("s", $username);
    execute_stmt($stmt, $mysqli);

    $return_post_time = "";
    $return_content = "";
    $return_story_id = 0;
    $return_recipient = "";
    $stmt->bind_result($return_post_time, $return_content, $return_story_id, $return_recipient);

    while ($stmt->fetch()) {
        echo "<div class='reply'>\n";
        printf("\t<p class='comment_content'><a href='postViewer.php?id=%u'> %s </a></p>\n", 
            $return_story_id,
            htmlentities(strip_tags($return_content))
            );
        printf("\t<p class='comment_signature'> %s replied to %s on %s </p>\n", 
        htmlentities($username),
                htmlentities($return_recipient),
                htmlentities($return_post_time)
            );
        echo "</div>\n";
        echo "<br>\n";
    }
    echo "</div>\n</div>\n</div><br><br><br>\n";

}

?>