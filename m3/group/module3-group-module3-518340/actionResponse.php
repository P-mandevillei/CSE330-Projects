<!--
This page shows the response message after some user actions.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" type="text/css" href="actionResponseStyle.css">
</head>
<body>

<?php
require_once 'homepageHelper.php';

// get arrival information
session_start();
if (isset($_SESSION['type'])) {
    $type = $_SESSION['type'];
} else {
    $type = '';
}
// initialize session
$username = false;
initialize_session($username);
$_SESSION['last_visit'] = $_SESSION['now'];
$_SESSION['now'] = 'actionResponse';
// default return destination
$return = 'homepage.php';

echo "<div class='message'>\n";

if ($type == 'invalid_username') {
    echo "Invalid Username.\n";
} 
// signin
else if ($type == 'signin_failed') {
    echo "Your account cannot be found.\n";
}
// signup
else if ($type == 'signup_user_exists') {
    echo "User already exists.\n";
} else if ($type == 'signup_success') {
    echo "Success!\n";
}
// signout
else if ($type == "invalid_signout") {
    echo "Invalid Signout.\n";
}

// post
else if ($type == "invalid_post_content") {
    echo "Invalid Post Content.\n";
} else if ($type == 'invalid_title') {
    echo "Invalid Title. Title must be within 255 characters long.\n";
} else if ($type == 'invalid_link') {
    echo "Invalid Link URL.";
} else if ($type == 'post_success') {
    echo "Success! Woo Hoo!";
} else if ($type == 'view_post_not_unique') {
    echo "An error has occurred. Post does not exist or is duplicated.\n";
} else if ($type == 'delete_post_success') {
    echo "Post successfully deleted!\n";
} else if ($type == 'edit_post_user_invalid') {
    echo "Error: You are attempting to edit a post that does not belong to you!\n";
} else if ($type == 'edit_success') {
    echo "Edit Success! Woo Hoo!\n";
}

// comment
else if ($type == 'leave_comment_success') {
    echo "Comment Posted Successfully! Woo Hoo!\n";
    $return = $_SESSION['return_dest'];
} else if ($type == 'comment_not_unique') {
    echo "An error has occurred. Comment does not exist or is duplicated.\n";
} else if ($type == 'edit_comment_user_invalid') {
    echo "Error: You are attempting to edit a comment that does not belong to you!\n";
} else if ($type == 'edit_comment_success') {
    echo "Edit Success! Woo Hoo!\n";
    $return = $_SESSION['return_dest'];
} else if ($type == 'delete_comment_success') {
    echo "Comment successfully deleted!\n";
    $return = $_SESSION['return_dest'];
}

// reply
else if ($type == 'reply_success') {
    echo "Reply Success!\n";
    $return = $_SESSION['return_dest'];
} else if ($type == 'reply_not_unique') {
    echo "An error has occurred. Reply does not exist or is duplicated.\n";
} else if ($type == 'edit_reply_user_invalid') {
    echo "Error: You are attempting to edit a reply that does not belong to you!\n";
} else if ($type == 'edit_reply_success') {
    echo "Edit Success! Woo Hoo!\n";
    $return = $_SESSION['return_dest'];
} else if ($type == 'delete_reply_success') {
    echo "Reply Deleted Successfully!\n";
    $return = $_SESSION['return_dest'];
}

// follow
else if ($type == 'already_following') {
    echo "You are already following this user.\n";
} else if ($type == 'user_DNE') {
    echo "Sorry, we cannot find your account or the account you wish to follow.\n";
} else if ($type == 'self_follow') {
    echo "You cannot follow yourself!\n";
} else if ($type == 'self_unfollow') {
    echo "You cannot unfollow yourself!\n";
} else if ($type == 'already_unfollowed') {
    echo "You have already unfollowed this user.\n";
}

else if ($type == 'invalid_token') {
    echo "Cannot Process Request: Invalid Token.\n";
}
// mysqli statement prep error
else if ($type == 'mysqli_prep_error') {
    $error = $_SESSION['error'];
    printf("Query Prep Failed: %s\n", htmlentities($error));
}
// mysqli statement execution error
else if ($type == 'mysqli_exe_error') {
    $error = $_SESSION['error'];
    printf("Execution Failed: %s\n", htmlentities($error));
}

// Catch illegal arrivals
else {
    echo "You seem to have arrived at the wrong place.\n";
}

echo "</div>\n";

// clear records
$_SESSION['type'] = '';
?>

<a href="<?php echo $return; ?>"> Click to Return </a>

</body>
</html>