<?php
/*
Executes bash commands, and if the command fails, redirects and shows error message.
*/

function exec_and_catch_error($cmd) {
    $output = null;
    $return_value = 0;
    
    // Try running the command
    try {
        exec($cmd, $output, $return_value);
    } catch (Exception $e) {
        // If it throws an error: redirect
        $_SESSION['type'] = 'shell_exec_error';
        header("Location: actionResponse.php");
        exit;
    }

    // Execution successful
    if ($return_value == 0) {
        return;
    }

    // Execution failed
    // Assuming session is started in main
    $_SESSION['type'] = 'shell_exec_error';
    header("Location: actionResponse.php");
    exit;
}

?>