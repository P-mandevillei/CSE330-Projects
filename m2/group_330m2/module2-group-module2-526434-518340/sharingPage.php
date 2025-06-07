<!--
Displays the name of the file to share by the user and asks for recipient's username.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sharing Confirmation</title>
    <link rel="stylesheet" href="sharingPageStyle.css">
</head>
<body>
    <?php
        require_once "checkSignin.php";
        session_start();
        // User must have signed in!
        checkSignin();
    
        $filename = $_GET['filename'];
        $output_filename = htmlentities($filename);
        echo "\t<header>Attention! You are about to share '$output_filename'...</header>\n";
    
        echo "\t<form action='sharingHandler.php' method='POST'>\n";
        echo "\t\t<input type='hidden' name='filename' value='$output_filename'>\n"; 
        echo "\t\t<label>Enter the recipient's username: </label>\n";
        echo "\t\t<input type='text' name='end_user'>\n";
        echo "\t\t<input type='submit' value='Share!'>\n";
        echo "\t</form>";
    ?>
    <img src="File_Sharing_Logo2.png" alt="File Sharing Logo">
</body>
</html>