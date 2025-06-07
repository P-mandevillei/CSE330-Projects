<!--
Page to display a user's profile
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <link rel="stylesheet" type="text/css" href="viewProfileStyle.css">
</head>
<body>
    
<?php
require_once 'viewProfileHelper.php';
require_once 'dataBase.php';
require_once 'homepageHelper.php';

session_start();
$username = false;
initialize_session($username);
$_SESSION['last_visit'] = $_SESSION['now'];
$_SESSION['now'] = 'viewProfile';
if ($username) {
    check_username($username);
}

if (isset($_SESSION['token'])) {
    $token = $_SESSION['token'];
} else {
    $token = '';
}

if (isset($_GET['username'])) {
    $profile_username = $_GET['username'];
} else {
    $profile_username = '';
}
// check if username is valid
check_username($profile_username);

// check if user exists
if (check_user($profile_username, $mysqli) != 1) {
    echo "<h1>User does not exist.</h1>\n";
    echo "<p><a href='homepage.php'> Click to Return </a></p>";
    echo "</body>\n</html>\n";
    exit;
}

printf("<h1>%s's Page</h1>", htmlentities(string: $profile_username));

// User must sign in to view profile
if (!$_SESSION['signin_newsViewer']) {
    echo "<strong>View their profile after signing in.</strong>\n";
    echo "<p><a href='login.php'> Sign in </a></p>";
    echo "</body>\n</html>\n";
    exit;
}

// Check if they are mutuals
$isFollower = check_follow($username, $profile_username, $mysqli);
$isFollowee = check_follow($profile_username, $username, $mysqli);
$isMutual = $isFollower && $isFollowee;

// Follow/Unfollow button
if (!$isFollower && $profile_username!=$username) {
    // Follow button: if the profile doesn't belong to the current user and the current user is not following
    echo "<div class='button'>\n";
    echo "<form action='userHandler.php' method='POST'>\n";
    echo "\t<input type='hidden' name='type' value='follow'>\n";
    printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
    printf("\t<input type='hidden' name='follower' value='%s'>\n", $username);
    printf("\t<input type='hidden' name='followee' value='%s'>\n", $profile_username);
    echo "\t<input type='submit' value='FOLLOW'>\n";
    echo "</form>\n";
    echo "</div>\n";
} else if ($isFollower) {
    // Unfollow button
    echo "<div class='button'>\n";
    echo "<form action='userHandler.php' method='POST'>\n";
    echo "\t<input type='hidden' name='type' value='unfollow'>\n";
    printf("\t<input type='hidden' name='token' value='%s'>\n", $_SESSION['token']);
    printf("\t<input type='hidden' name='follower' value='%s'>\n", $username);
    printf("\t<input type='hidden' name='followee' value='%s'>\n", $profile_username);
    echo "\t<input type='submit' value='UNFOLLOW'>\n";
    echo "</form>\n";
    echo "</div>\n";
}

if ($isMutual || $profile_username==$username) {
    if ($profile_username!=$username) {
        echo "<div class='section'> You are moots!!! </div>\n<br><br><br>\n";
    }
    display_profile($profile_username, $mysqli);
}

?>

<p><a href="homepage.php"> Click to Return </a></p>

</body>
</html>