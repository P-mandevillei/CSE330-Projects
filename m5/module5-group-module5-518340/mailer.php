<?php
/*
This page generates emails to users who have an event due in 30 minutes.
mail object methods and settings referenced from: https://github.com/PHPMailer/PHPMailer
*/

ini_set("display_error", 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once '/home/charlie/vendor/autoload.php';
require_once "dataBase.php";
require_once "validator.php";

$WEEK_TO_INDEX = ['sunday'=>0, 'monday'=>1, 'tuesday'=>2, 'wednesday'=>3, 'thursday'=>4, 'friday'=>5, 'saturday'=>6];

function mailTo($recipient_address, $recipient_name, $subject, $body) {
    // Generates an email to $recipient_address
    // Reference: https://github.com/PHPMailer/PHPMailer

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;  // Enable debug output
        $mail->isSMTP();                        
        $mail->Host       = 'smtp.gmail.com';   // Gmail SMTP server
        $mail->SMTPAuth   = true;               
        $mail->Username   = 'xxxxxxxx@gmail.com'; // my email address 
        $mail->Password   = 'xxxxxxxxxxxxxxxx';  // my app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Use SSL encryption
        $mail->Port       = 465; // SSL port
    
        // Recipients
        $mail->setFrom('xxxxxxxx@gmail.com', 'CSE330 Calendar');
        $mail->addAddress($recipient_address, $recipient_name); 
    
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = 'This is a friendly reminder from Fantastic Calendar that you have events happening in the next 30 minutes.';
    
        $mail->send();
        echo 'Message has been sent to '.$recipient_address;
    } catch (Exception $e) {
        echo "Message could not be sent to ".$recipient_address.". Mailer Error: {$mail->ErrorInfo}";
    }
}

// For run checks; disabled since emails too frequently
// mailTo("charlie.l38324@gmail.com", "Charlie Li", "Reminder Sent", "Reminder Sent");

// get current time
$current_time = new DateTime("now", new DateTimeZone("America/Chicago"));
$format_time = explode("-",  $current_time->format("Y-m-l-d"));
$curYear = $format_time[0];
$curMonth = $format_time[1];
$curWeek = $format_time[2];
$curDate = $format_time[3];

// convert to format used in database
$curYear = str_pad($curYear, 5, "0", STR_PAD_LEFT);
$curMonth = str_pad($curMonth, 2, "0", STR_PAD_LEFT);
$curDate = str_pad($curDate, 2, "0",  STR_PAD_LEFT);

$dateStr = $curYear.$curMonth.$curDate;
$weekBin = 1 << (6-$WEEK_TO_INDEX[strtolower($curWeek)]);

$format_time = explode("-", $current_time->format("H-i"));
$curHourInt = (int)$format_time[0];
$curMinINt = (int)$format_time[1];

// retrieve events
$stmt = $mysqli->prepare(
    "select events.username, title, time, email from events left join users on (events.username=users.username) where users.email!='none' and reminder='1' and date<=? and end>=? and (recurOn & ?)!=0 order by events.username asc, time asc"
);
if (!$stmt) { echo "An Error Was Encountered in Database."; exit; }
$stmt->bind_param("ssi", $dateStr, $dateStr, $weekBin);
$stmt->execute();

$username = "";
$title = "";
$time = "";
$email = "";
$stmt->bind_result($username, $title, $time, $email);

// prepare email body
$header = "<div style='color: black; font: 24px/26px Verdana, sans-serif;'>
            This is a friendly reminder from <strong><i>Fantastic Calendar</i></strong> that your event(s)<ul>";
$tail = "</ul>are happening in 30 minutes!</div>";

$nonExistenceUser = "noSuchUserExists"; // since usernames are <=12 characters, this would never be a username
$lastUser = $nonExistenceUser;
$lastEmail = "xxxxxxxx@wustl.edu"; // set to my email address for error checking purposes

$body = $header;

// We bundle the messages together for each user
while ($stmt->fetch()) {
    $hourInt = (int)substr($time, 0, 2);
    $minInt = (int)substr($time, 2, 2);
    $timeDiff = $minInt - $curMinINt + 60*($hourInt - $curHourInt); // in minutes
    
    // if time in range
    if ($timeDiff <= 30 && $timeDiff>0) {
        
        // if this is a new user
        if ($lastUser != $username) {
            // if the last user exists
            if ($lastUser != $nonExistenceUser) {
                mailTo($lastEmail, $lastUser, "Reminder from Fantastic Calendar", "$body $tail");
            }
            $lastUser = $username; // update last user
            $lastEmail = $email; // update email
            $body = $header; // initialize
        }

        $intHr = (int)substr($time, 0, 2);
        $intMin = substr($time, 2, 2);
        $AMorPM = $intHr<12? 'am' : 'pm';
        $displayTimeStr = sprintf("%d : %s %s", $intHr%12==0? 12 : $intHr%12, $intMin, $AMorPM);
        
        // format message
        $msg = sprintf("<li> <strong style='color: rgb(33, 87, 50);'>'%s' </strong><strong style='color: rgb(186, 12, 47);'>(%s)</strong> </li>",
            htmlentities($title), 
            htmlentities($displayTimeStr));
        $body .= $msg;
    }
    
}

// send out the last email
if ($lastUser != $nonExistenceUser) {
    mailTo($lastEmail, $lastUser, "Reminder from Fantastic Calendar", "$body $tail");
}

?>