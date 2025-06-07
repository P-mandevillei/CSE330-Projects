<!--
The signup page.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
    <link rel="stylesheet" type="text/css" href="signupStyle.css">
</head>
<body>

    <?php 
    require_once 'homepageHelper.php';
    session_start();
    $username = false;
    initialize_session($username);
    $_SESSION['last_visit'] = $_SESSION['now'];
    $_SESSION['now'] = 'signup';
    ?>

    <div id="welcome">
        Welcome to the <br> Ultimate News Viewer!
    </div>

    <!-- Sign up button -->
    <div id='signup'>
        <div class='signup' id='signup_word'>
            Sign Up
        </div>
        <br>
        <form class='signup' id='name_input' action="userHandler" method='POST'>
            <input type='hidden' name='type' value='signup'>
            <input type='hidden' name="token" value="<?php echo $_SESSION['token']; ?>">
            <input type='text' name='username' placeholder="Username (Within 12 Characters)">
            <input type='password' name='password' placeholder="Password">
            <input type='submit' value='Sign Up!'>
        </form>
    </div>

    <a href="login.php">Return</a>
    
</body>
</html>