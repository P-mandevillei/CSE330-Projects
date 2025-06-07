# CSE330
P-mandevillei<br><br>

Log in credentials:
| username | password |
|----------|----------|
| TestUser | TestUser |
|TestUser2 |TestUser2 |

# Creative Portion
1. **Supports Recurring Events**<br>
   - Users can toggle between recurring and non-recurring event options when adding and editing events.<br>
   - All events have a start date (stored as "date" in database) and an end date ("end") (inclusive).
   - Recurrence is stored as "recurOn", which is a 7-bit binary string. Each bit represents whether that event should occur on that weekday, in the sequence of (Sun-Mon-Tue-Wed-Thu-Fri-Sat). Non-recurring events have end date equal to start date and a recurrence string of 1111111. A recurring event on Mon and Wed, for example, would have a recurrence string of 0101000.
   
2. **Users can share their calendars with other users** <br>
   - Sharing is voluntary and one-direction, and can be terminated at any time. Once shared, the sharee can view your calendar, but cannot edit it.

3. **Reminder emails can be sent for events with the option "Remind Me" enabled if user has provided an email address** <br>
   - A backend cron job is set to run the mailer.php script every 30 minutes, which retrieves all events within 30 minutes of current Chicago time whose "reminder" field is true and has an email address associated with username. The script then bundles those events together based on username, and sends emails to each user based on their provided email address.
   - [PHPMailer](https://github.com/PHPMailer/PHPMailer) is used to implement the email function.
   - Since the script runs on backend, it does not support reminding on local time yet. I imagine a database field could be used to store the input time zone, but that would require additional work.
   - Email should look like this in Gmail:
   ![Screenshot 2025-03-12 153722](https://github.com/user-attachments/assets/78fda455-d0bf-4edd-8b12-089e8c96ad9a)
   - *Note*: inline CSS is used in the preparation of the email body. It is the only way to override the default styles in the email.