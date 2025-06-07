<?php
/*
This processor page handles signin, signup requests.
*/
ini_set("session.cookie_httponly", 1);
require_once "validator.php";
require_once "dataBase.php";

header("Content-Type: application/json");

session_start();
$json_request = json_decode(file_get_contents('php://input'), true);

// Check for CSRF
$token = $json_request['token']?? '';
if ($token !== $_SESSION['token']) {
    echo json_encode(['success'=>false, 'msg'=>"Invalid Token"]);
    exit;
}

$type = $json_request['type']?? '';


// Handles signin
if ($type === 'signin') {
    // check if already signed in
    if ($_SESSION['signin_calendar']) {
        echo json_encode(["success"=>false, "msg"=>"Please First Sign Out"]);
        exit;
    }

    $username = $json_request['username'];
    $password = $json_request['password'];

    // Checks if username is allowed
    if (!check_username($username)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Username"]);
        exit;
    }
    // If password matchs: redirect to homepage.
    // Otherwise redirect to signin.
    if (check_user_password($username, $password, $mysqli)) {
        $_SESSION['signin_calendar'] = true;
        $_SESSION['username'] = $username;
        echo json_encode(["success"=>true, "msg"=>"Signin Success!"]);
        exit;
    } else {
        echo json_encode(["success"=>false, "msg"=>"Account Not Found"]);
        exit;
    }
}

// Handles signup
else if ($type === 'signup') {
    
    $username = $json_request['username'];
    $password = $json_request['password'];
    
    // Checks if username is allowed
    if (!check_username($username)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Username"]);
        exit;
    }
    // Checks if the user already exists
    if (check_user($username, $mysqli)!=0) {
        echo json_encode(['success'=>false, 'msg'=>"Username Already Exists"]);
        exit;
    }
    // Hash and salt the password
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert username and password into database
    $stmt = $mysqli->prepare("Insert into users (username, password) values (?, ?)");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("ss", $username, $hash);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success'=>true, 'msg'=>"Signup Success!"]);
    exit;
}

// sign out
else if ($type === 'signout') {
    
    // check if user is signed in
    if (!$_SESSION['signin_calendar']) {
        echo json_encode(['success'=>false, 'msg'=>"You Are Not Signed In Yet"]);
        exit;
    }

    // destroy session
    session_destroy();
    // reinitialize session
    // session already set to http only from above
    session_start();
    $_SESSION = array(); // Initialization
    $_SESSION['signin_calendar'] = false; // Keep track of if the user is signed in
    $_SESSION['token'] = bin2hex(random_bytes(32)); // Session token for CSRF
    $_SESSION['username'] = false;

    echo json_encode(['success'=>true, 'msg'=>"You Have Been Signed Out", 'token'=>$_SESSION['token']]);
    exit;
}

// tells if the user is signed in
else if ($type === 'checkSignIn') {
    echo json_encode(['signin'=>$_SESSION['signin_calendar'], 'username'=>$_SESSION['username']]);
    exit;
}

// retrieve email address
else if ($type === 'getEmail') {
    // reject not signed in users
    if (!$_SESSION['signin_calendar']) {
        echo json_encode(['success'=>false, 'msg'=>"Please First Sign In!"]);
        exit;
    }
    // Checks if username is allowed
    $username = $_SESSION['username'];
    if (!check_username($username)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Username"]);
        exit;
    }
    if (!(check_user($username, $mysqli)===1)) {
        echo json_encode(['success'=>false, 'msg'=>"Please First Sign In!"]);
        exit;
    }
    // query for email
    $stmt = $mysqli->prepare("select email from users where username=?");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $email = "";
    $stmt->bind_result($email);
    $stmt->fetch();
    $stmt->close();

    echo json_encode(['success'=>true, 'email'=>$email]);
    exit;
}

// update email address
else if ($type === 'setEmail') {
    // reject not signed in users
    if (!$_SESSION['signin_calendar']) {
        echo json_encode(['success'=>false, 'msg'=>"Please First Sign In!"]);
        exit;
    }
    // Checks if username is allowed
    $username = $_SESSION['username'];
    if (!check_username($username)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Username"]);
        exit;
    }
    // ensure user exists
    if (!(check_user($username, $mysqli)===1)) {
        echo json_encode(['success'=>false, 'msg'=>"Please First Sign In!"]);
        exit;
    }
    // check email
    $inputEmail = $json_request['email'];
    if (!check_email($inputEmail)) {
        echo json_encode(['success'=>false, 'msg'=>"Invalid Email Address!"]);
        exit;
    }

    // update entry
    $stmt = $mysqli->prepare("update users set email=? where username=?");
    if (!$stmt) {echo json_encode(['success'=>false, 'msg'=>"An Error Occurred In Database"]); exit;}
    $stmt->bind_param("ss", $inputEmail, $username);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success'=>true, 'msg'=>"Email Updated!"]);
    exit;
}

// catch illegal arrivals
else {
    echo json_encode(['success'=>false, 'msg'=>"You Seem To Have Submitted An Unrecognized Request!"]);
    exit;
}


?>