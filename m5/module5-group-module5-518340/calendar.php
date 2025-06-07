<!-- Main Page -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendar</title>

    <!-- Bootstrap Stylesheet: https://getbootstrap.com/ -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="calendar.css">
    <!-- JQuery dialog stylesheet -->
    <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/start/jquery-ui.css" type="text/css" rel="Stylesheet"> 
    
    <!-- JQuery -->
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/jquery-ui.min.js"></script>
    <!-- Calendar API -->
    <script src="https://classes.engineering.wustl.edu/cse330/content/calendar.js"></script>
    <script src="calendar.js" defer></script>
</head>

<body>
    <header>
        Fantastic Calendar
    </header>

    <?php
    // initialize session on refresh
    ini_set("session.cookie_httponly", 1);
    session_start();
    if (!isset($_SESSION['signin_calendar'])) {
        $_SESSION = array(); // Initialization
        $_SESSION['signin_calendar'] = false; // Keep track of if the user is signed in
        $_SESSION['token'] = bin2hex(random_bytes(32)); // Session token for CSRF
        $_SESSION['username'] = false;
    }
    ?>
    <!-- Handle to pass token to calendar.js -->
    <p class="handle" id="token"><?php echo htmlentities($_SESSION['token']); ?></p>

    <!-- Bootstrap Responsive Grid -->
    <div class="container">
    <div class="row">
    <!-- Left Column: Options -->
    <div class="col-2" id="credentials">
        <p id="welcome"></p>
        <!-- Sign Up Button -->
        <button class="showWhenSigninfalse" id="signupButton">Sign Up</button>
        <div id="signupDialog" class="dialog">
            <strong>Sign Up</strong>
            <form id="signupForm">
                <label for="signup_username">Username: <input type="text" name="username" id="signup_username" placeholder="Username (1-12 Symbols)"></label> 
                <label for="signup_password">Password: <input type="password" name="password" id="signup_password" placeholder="Password"></label>
                <input type="submit" value="Sign Up!">
            </form>
        </div>
        <!-- Sign In Button -->
        <button class="showWhenSigninfalse" id="signinButton">Sign In</button>
        <div id="signinDialog" class="dialog">
            <strong>Sign In</strong>
            <form id="signinForm">
                <label for="signin_username">Username: <input type="text" name="username" id="signin_username" placeholder="Username"></label> 
                <label for="signin_password">Password: <input type="password" name="password" id="signin_password" placeholder="Password"></label>
                <input type="submit" value="Sign In">
            </form>
        </div>
        <!-- Sign Out Button -->
        <button class="showWhenSignintrue" id="signoutButton">Sign Out</button>

        <!-- Ask for user email -->
        <div class="showWhenSignintrue" id="no-email">
            Provide or Update Your Email Address So Reminders Can Be Sent:
            <input type="text" id="inputEmail">
            <button id="inputEmailButton">Confirm</button>
            <p id="displayEmail"></p>
        </div>

        <!-- Add Event Button -->
        <button class="showWhenSignintrue" id="addEventButton">Add Event</button>
        <div id="addEventDialog" class="dialog">
            <strong>Add Event</strong>

            <select name="EventType" id="addEventTypeSelect">
                <option value="event">Does Not Repeat</option>
                <option value="Revent">Recurring</option>
            </select>

            <form id="addEventForm">

            <!-- Non Recurring Events-->
            <div id="addEventNonRecurring">
                <label for="addEvent_title">Title: <input type="text" name="title" id="addEvent_title"></label>
                <label for="addEvent_date">Date: <input type="date" name="date" id="addEvent_date"></label> 
                <label for="addEvent_time">Time: <input type="time" name="time" id="addEvent_time"></label>
                <select id="addEvent_reminder">
                    <option value="0">Don't Remind Me</option>
                    <option value="1">Remind Me</option>
                </select>
                <input type="submit" value="Create Event">
            </div>

            <!-- Recurring Events-->
            <div id="addEventRecurring" class="dialog">
                <p>Recurring Events Start on The Start Date and End After The End Date.</p>
                <label for="addREvent_title">Title: <input type="text" name="title" id="addREvent_title"></label>
                <label for="addREvent_start">Start on: <input type="date" name="date" id="addREvent_start"></label>
                <label for="addREvent_end">End After: <input type="date" name="date" id="addREvent_end"></label>
                <label for="addREvent_time">Time: <input type="time" name="time" id="addREvent_time"></label>
                <select id="addREvent_reminder">
                    <option value="0">Don't Remind Me</option>
                    <option value="1">Remind Me</option>
                </select>
                <!-- Selection Field For Recurring Events -->
                <div id="addREventRadio">
                    <p>Recur On:</p>
                    <input type="checkbox" name="addREventRadio" id="addREventRadio0" value="0">
                    <label for="addREventRadio0">Sun</label><br>
                    <input type="checkbox" name="addREventRadio" id="addREventRadio1" value="1">
                    <label for="addREventRadio1">Mon</label><br>
                    <input type="checkbox" name="addREventRadio" id="addREventRadio2" value="2">
                    <label for="addREventRadio2">Tue</label><br>
                    <input type="checkbox" name="addREventRadio" id="addREventRadio3" value="3">
                    <label for="addREventRadio3">Wed</label><br>
                    <input type="checkbox" name="addREventRadio" id="addREventRadio4" value="4">
                    <label for="addREventRadio4">Thu</label><br>
                    <input type="checkbox" name="addREventRadio" id="addREventRadio5" value="5">
                    <label for="addREventRadio5">Fri</label><br>
                    <input type="checkbox" name="addREventRadio" id="addREventRadio6" value="6">
                    <label for="addREventRadio6">Sat</label><br>
                </div>                
                <input type="submit" value="Create Recurring Event">
            </div>

            </form>
        </div>

        <!-- Share Button -->
        <button class="showWhenSignintrue" id="shareButton">Share Your Calendar</button>
        <div id="shareDialog" class="dialog">
            <strong>Share Your Calendar With...</strong>
            <label for="sharee"><input type="text" name="username" id="sharee" placeholder="Username"></label> 
            <button id="share">Share!</button>
        </div>

        <!-- Sharing List -->
        <div id="sharingList" class="showWhenSignintrue"></div>

        <!-- Shared List -->
        <div id="sharedList" class="showWhenSignintrue">
            View calendar:
            <select id="sharedListSelect"></select>
        </div>
    
    </div>

    <!-- Right Column: Calendar -->
    <div class="col-10" id="calendar">
        <div id="calendar_heading">
            <p class="calendar_heading" id="displayedMonth"></p>
            <p class="calendar_heading" id="lastMonth">&larr;</p>
            <p class="calendar_heading" id="nextMonth">&rarr;</p>
            <p class="calendar_heading" id="displayToday">Today</p>
        </div>
        <!-- Bootstrap Responsive Grid for Calendar Body -->
        <!-- With some reference from ChatGPT -->
        <div class="container" id="calendar_container">
            <div class="row d-flex flex-nowrap overflow-auto">
                <div class="col bg-light border"><p class="headings">Sun</p></div>
                <div class="col bg-light border"><p class="headings">Mon</p></div>
                <div class="col bg-light border"><p class="headings">Tue</p></div>
                <div class="col bg-light border"><p class="headings">Wed</p></div>
                <div class="col bg-light border"><p class="headings">Thu</p></div>
                <div class="col bg-light border"><p class="headings">Fri</p></div>
                <div class="col bg-light border"><p class="headings">Sat</p></div>
            </div>
        </div>
    </div>

    </div>
    </div>

    <!-- Edit Events -->
    <div id="eventOptionDialog" class="dialog">
        <!-- handle to store the ID of current event -->
        <p id="curID" class="handle"></p>
        <strong id="eventOptionHeader">Event Options</strong>

        <select name="EventType" id="editEventTypeSelect">
            <option value="event">Does Not Repeat</option>
            <option value="Revent">Recurring</option>
        </select>

        <!-- Non Recurring Events-->
        <div id="editEventNonRecurring">
            <label for="eventOption_title">Title: <input type="text" name="title" id="eventOption_title"></label>
            <label for="eventOption_date">Date: <input type="date" name="date" id="eventOption_date"></label> 
            <label for="eventOption_time">Time: <input type="time" name="time" id="eventOption_time"></label>
            <select id="eventOption_reminder">
                <option value="0">don't remind me</option>
                <option value="1">remind me</option>
            </select>
        </div>
        <!-- Recurring Events-->
        <div id="editEventRecurring" class="dialog">
            <p>Recurring Events Start on The Start Date and End After The End Date.</p>
            <label for="editREvent_title">Title: <input type="text" name="title" id="editREvent_title"></label>
            <label for="editREvent_start">Start on: <input type="date" name="date" id="editREvent_start"></label>
            <label for="editREvent_end">End After: <input type="date" name="date" id="editREvent_end"></label>
            <label for="editREvent_time">Time: <input type="time" name="time" id="editREvent_time"></label>
            <select id="editREvent_reminder">
                <option value="0">don't remind me</option>
                <option value="1">remind me</option>
            </select>
            <!-- Selection Field For Recurring Events -->
            <div id="editREventRadio">
                <p>Recur On:</p>
                <input type="checkbox" name="editREventRadio" id="editREventRadio0" value="0">
                <label for="editREventRadio0">Sun</label><br>
                <input type="checkbox" name="editREventRadio" id="editREventRadio1" value="1">
                <label for="editREventRadio1">Mon</label><br>
                <input type="checkbox" name="editREventRadio" id="editREventRadio2" value="2">
                <label for="editREventRadio2">Tue</label><br>
                <input type="checkbox" name="editREventRadio" id="editREventRadio3" value="3">
                <label for="editREventRadio3">Wed</label><br>
                <input type="checkbox" name="editREventRadio" id="editREventRadio4" value="4">
                <label for="editREventRadio4">Thu</label><br>
                <input type="checkbox" name="editREventRadio" id="editREventRadio5" value="5">
                <label for="editREventRadio5">Fri</label><br>
                <input type="checkbox" name="editREventRadio" id="editREventRadio6" value="6">
                <label for="editREventRadio6">Sat</label><br>
            </div>
        </div>

        <button id="editEvent">Edit</button>
        <button id="deleteEvent">Delete</button>
    </div>

</body>
</html>