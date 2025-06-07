<!--
Log in page.
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Ultimate News Viewer</title>
    <link rel="stylesheet" type="text/css" href="loginStyle.css">
</head>
<body>
    <?php    
    require_once 'homepageHelper.php';
    
    session_start();
    $username = false;
    initialize_session($username);
    $_SESSION['last_visit'] = $_SESSION['now'];
    $_SESSION['now'] = 'login';
    ?>

    <div>
        <div id="welcome">
            Welcome to the <br> Ultimate News Viewer!
        </div>

        <!-- Sign in button -->
        <div id='signin'>
            <div class='signin' id='signin_word'>
                Sign In By Entering Your User Name:
            </div>
            <br>
            <form class='signin' id='name_input' action="userHandler" method='POST'>
                <input type='hidden' name='type' value='signin'>
                <input type='hidden' name="token" value="<?php echo $_SESSION['token']; ?>">
                <input type='text' name='username' placeholder="Enter Your Username">
                <input type='password' name='password' placeholder="Enter Your Password">
                <input type='submit' value='Sign In'>
            </form>
        </div>
        
        <br><br>
        <!-- Sign up button -->
        <div id='signup'>
            <strong class='signup' id='signup_word'>
                No Account Yet? <a href='signup.php'>Sign Up Here.</a>
            </strong>
        </div>
    </div>

    <a href="homepage.php">Return to Homepage</a>

</body>
</html>