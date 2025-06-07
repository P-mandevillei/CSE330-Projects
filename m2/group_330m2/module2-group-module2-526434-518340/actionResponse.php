<!-- 
Relay hub for users.
Takes a session argument from other webpages,
And display the appropriate reponse message and the return button.
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Action Response</title>
    <link rel="stylesheet" href="actionResponseStyle.css">
    
</head>

<body>
    <img src="Thinking_Bubble.png" alt="Thinking Bubble">
    <br>
    <div id="response_msg">
    <?php
        require_once "return.php";
        session_start();

        // Monitors if the return button has been pressed
        returnIfNeeded();

        $type = $_SESSION['type'];

        // If redirected from signup: redirect to sign in.
        if ($type == 'signup') {
            // check if user already exists
            $isExisting = $_SESSION['isExisting'];
            if (!$isExisting) {
                echo "Success!";

            } else {
                echo "Signup Failed: User Already Exists.";
            }
            returnToSignInButton();
        } else if ($type == 'signup_invalid_username') {
            echo "Invalid Username";
            returnToSignInButton();
        }
    
        // If redirected from signin: if user doesn't exist, redirect to sign in.
        else if ($type == 'signin') {
            $isExisting = $_SESSION['isExisting'];
            if (!$isExisting) {
                echo "User Does Not Exist. Please First Sign Up.";
            } else {
                // User arrived at this page by means unintented by the developers
                echo "You Seem To Have Arrived At The Wrong Place.";
            }
            returnToSignInButton();
        } 

        // If redirected from upload/share: redirect to homepage.
        else if ($type == 'invalid_username') {
            echo "Invalid Username";
            returnToHomepageButton();
        } else if ($type == 'invalid_filename') {
            echo "Invalid Filename";
            returnToHomepageButton();
        } else if ($type == 'duplicate_file') {
            echo "Failure: A File With The Same Name Already Exists";
            returnToHomepageButton();
        } else if ($type == 'upload_success') {
            echo "Upload Success! Woo Hoo!";
            returnToHomepageButton();
        } else if ($type == 'upload_failure') {
            echo "Something Went Wrong.";
            returnToHomepageButton();
        } else if ($type == 'share_user_nonexistence') {
            echo "The end user does not exist.";
            returnToHomepageButton();
        } else if ($type == 'share_file_nonexistence') {
            echo "The file you wish to share does not exist.";
            returnToHomepageButton();
        } else if ($type == 'share_success') {
            echo "Sharing Successful. Woo Hoo!";
            returnToHomepageButton();
        } else if ($type == 'stop_sharing_success') {
            echo "Sharing Terminated Successfully";
            returnToHomepageButton();
        } else if ($type == 'stop_share_file_nonexistence') {
            echo "Error: File does not exist";
            returnToHomepageButton();
        }

        // If redirected from file deletion: redirect to homepage
        else if ($type == 'delete_file_success') {
            echo "File Deleted Successfully";
            returnToHomepageButton();
        } else if ($type == 'delete_file_not_found') {
            echo "Error: File Not Found";
            returnToHomepageButton();
        }

        // If redirected from account deletion: redirect to signin
        else if ($type == 'delete_account_success') {
            echo "Account Deleted Successfully";
            returnToSignInButton(); // This will destroy the current session
        } else if ($type == 'delete_account_not_found') {
            echo "Error: Account Not Found";
            returnToSignInButton();
        }

        // If redirected from view: redirect to homepage
        else if ($type == 'view_nonexistent_file') {
            echo "Error: File Not Found";
            returnToHomepageButton();
        }

        // If redirected from shell error: first redirect to signin 
        // (since don't know where it failed)
        // If user is logged in, will be redirected to homepage by sigin page
        else if ($type == 'shell_exec_error') {
            echo "Error: Command execution failed. Maybe check your permissions?";
            returnToSignInButton();
        }

        // If entered from elsewhere: direct to signin
        // User arrived at this page by means unintented by the developers
        else {
            echo "You seem to have arrived at the wrong place.";
            returnToSignInButton();
        }

?>
</div>

</body>

</html>