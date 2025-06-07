<!--
The sign in page of the fileSharer website.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Sharer</title>
    <link rel="stylesheet" href="fileSharerStyle.css">
</head>

<body>
    <?php
    session_start();
        // If user is logged in: redirect to homepage
        if (isset($_SESSION) && $_SESSION['signin']=='SUCCESS') {
            header("Location: userHome.php");
        }
    ?>
    <div class="split left">
        <div class="content1">
            <h1> Welcome to File Sharer! </h1>
            <img src="File_Sharing_Logo2.png" alt="File Sharing Logo">
        </div>
    </div>
    <div class="split right">
        <div class="content2">
            <!-- Sign in button -->
            <div id='signin'>
                <strong class='signin' id='signin_word'>
                    Sign In By Entering Your User Name:
                </strong>
                <br>
                <form class='signin' id='name_input' action="userHandler" method='POST'>
                    <input type='hidden' name='type' value='signin'>
                    <input type='text' name='username'>
                    <input type='submit' value='Sign In'>
                </form>
            </div>
            <br><br>
            <!-- Sign up button -->
            <div id='signup'>
                <strong class='signup' id='signup_word'>
                    No Account Yet? Sign Up Here:
                </strong>
                <br>
                <form class='signup' id='redirect' action='fileSharerSignup.php' method='GET'>
                    <input type='submit' value='Sign Up'>
                </form>
            </div>
        </div>
    </div>
</body>
</html>