<!--
The sign up page of the file sharer website.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
    <link rel="stylesheet" href="fileSharerSignupStyle.css">
</head>
<body>

<header id='welcome'> Welcome To File Sharer! </header>
<br>
<img src="File_Sharing_Logo2.png" alt="File Sharing Logo">   
<br><br>
<div id='signup'>
    <strong class='signup' id='word'>
        Enter Your Username To Sign Up:
    </strong>
    <br><br>
    <form class='signup' id='name_input_signup' action='userHandler.php' method='POST'>
        <input type='hidden' name='type' value='signup'>
        <input type='text' name='username'>
        <input type='submit' value='Sign Up!'>
        <br> <br>
    </form>
</div>

<?php
require_once "return.php";
returnIfNeeded();
returnToSignInButton();
?>
</body>
</html>