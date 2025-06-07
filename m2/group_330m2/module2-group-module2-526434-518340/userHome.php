<!--
The user homepage of file sharer website.
Displays all files uploaded, shared and shared with.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <link rel="stylesheet" href="userHomeStyle.css">
</head>

<body>
    <!-- <img src="background.jpg" alt="background"> -->
    <div class="split left">
        <div class="file_display">
            <?php
                require_once "userHomeHelper.php";
                require_once "return.php";
                require_once "checkSignin.php";
                // Check Identity and Initialize
                session_start();
                returnIfNeeded(); // Monitor if the user has signed out

                // Check: User must enter from the signin page!
                checkSignin(); 

                $username = $_SESSION['username'];
                $userPath = $_SESSION['userPath'];
                $userFile = $_SESSION['userFile'];

                // Read and Display All Files
                read_and_display($userFile);
            ?>
        </div>
    </div>
    <div class = "split right">
        <div class = "upload_button">
            <!-- Upload Button -->  
            <form enctype="multipart/form-data" action="uploadHandler.php" method="POST">
                <p>
                    <input type="hidden" name="MAX_FILE_SIZE" value="20000000">
                    <label for="uploadfile_input">Choose a file to upload:</label> 
                    /br></br>
                    <input name="uploadedfile" type="file" id="uploadfile_input">
                </p>
                <p>
                    <input type="submit" value="Upload File">
                </p>
            </form>
        </div>
        <div class= "sign_out">
            <p>
                <?php
                    signOutButton();
                    deleteAccountButton();
                ?>
            </p>
        </div>
    </div>
</body>

</html>