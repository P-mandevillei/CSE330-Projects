"use strict";
/*
This is the javascript document for implementing calendar.php
*/

let isSignedIn = false;
const curTime = new Date();
let thisMonth = new Month(curTime.getFullYear(), curTime.getMonth());
const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let curViewedUser = "yourOwnCalendar";
// get whose calendar is being viewed
const getViewedUser = () => curViewedUser;

const getToken = () => document.getElementById('token').textContent;

// erase memory of dialogs
function resetAllInput() {
	[...document.getElementsByTagName("input")].map(node => {
		if (node.getAttribute("type")!="submit") {
			node.value = "";
		}
	});
	[...document.getElementsByName("EventType")].map(node => node.value = "event");
	$("#addEventNonRecurring").show();
	$("#addEventRecurring").hide();
	$("#editEventNonRecurring").show();
	$("#editEventRecurring").hide();
}

// Manage visibility of buttons and update the sign in status
function updateSignInStatus() {
	fetch("userHandler.php", {
		method: "POST",
		body: JSON.stringify({token: getToken(), type: "checkSignIn"}),
		headers: {"content-type": "application/json"}
	}).then(response => response.json())
	.then(result => {
		isSignedIn = result.signin;
		$(".showWhenSignin"+isSignedIn).show();
		$(".showWhenSignin"+(!isSignedIn)).hide();

		if (isSignedIn) {
			document.getElementById("welcome").textContent = `Welcome, ${result.username}!`;
		} else {
			document.getElementById("welcome").textContent = "";
		}
	})
	.catch(err => console.log(err));
}
updateSignInStatus();

// Update display
function updateCalendar(){
	// first create the calendar skeleton

	const month = thisMonth;
	document.getElementById("displayedMonth").textContent = `${monthsList[month.month]} ${month.year}`;

	// Initialization
	let calendarNode = document.getElementById("calendar_container");
	const headingNode = calendarNode.children[0];
	calendarNode.innerHTML = "";
	calendarNode.appendChild(headingNode);

	// parse weeks
	const weeks = month.getWeeks();
	for(let week in weeks){
		// create the current week row
		let rowNode = document.createElement("div");
		rowNode.setAttribute("class", "row d-flex flex-nowrap overflow-auto");

		// parse days
		let days = weeks[week].getDates();
		days.reduce((prev, cur) => {
			const curDate = cur.getDate();
			const curMonth = cur.getMonth();
			const curYear = cur.getFullYear();
			const curWeekDay = cur.getDay();

			// create the grid node
			let divNode = document.createElement("div");
			divNode.setAttribute("class", "col bg-light border");
			let pNode = document.createElement("div");
			// separate the styles for current and non-current months
			if (curMonth == month.month) {
				pNode.setAttribute("class", "entries curMonth");
			} else {
				pNode.setAttribute("class", "entries nonCurMonth");
			}
			// Mark today
			if (curYear == curTime.getFullYear() && curMonth == curTime.getMonth() && curDate == curTime.getDate()) {
				divNode.setAttribute("id", "today");
				divNode.setAttribute("class", "col border")
			}
			let textNode = document.createElement("p");
			textNode.setAttribute("class", "date");
			textNode.textContent = curDate;
			pNode.appendChild(textNode);

			// Handle for displaying events on this date
			const dateStr = curWeekDay.toString() + curYear.toString().padStart(5, '0') + (curMonth+1).toString().padStart(2, '0') + curDate.toString().padStart(2, '0');
			const hiddenDate = document.createElement("p");
			hiddenDate.setAttribute("class", "handle dateStr");
			hiddenDate.textContent = dateStr;
			pNode.appendChild(hiddenDate);

			divNode.appendChild(pNode);
			prev.appendChild(divNode);

			return prev;
		}, rowNode);
		calendarNode.appendChild(rowNode);
	}

	// now display events
	displayEvents();
}

function displayEvents() {
	// get all dates
	const dateStrNodes = document.getElementsByClassName("dateStr");

	[...dateStrNodes].map((dateStrNode) => {
		const fullDateStr = dateStrNode.textContent;
		const weekDay = fullDateStr.substring(0, 1);
		const dateStr = fullDateStr.substring(1);
		const viewedUser = getViewedUser();

		// fetch the events by the currently logged in user and the user who's being viewed
		const data = {"viewed": viewedUser, "date": dateStr, "week": weekDay, "token": getToken(), "type": "query_events"};
		fetch("eventHandler.php", {
			"method": "POST",
			"body": JSON.stringify(data),
			"content-type": "application/json"
		}).then(response => response.json())
		.then(results => {
			// if not success: abort
			if (!results.success || !results.hasOwnProperty("events")) { return; }
			
			// append all events to the parent of the dateStr node
			const events = results.events;
			
			events.reduce((prev, cur) => {
				const title = cur[1];
				const timeStr = cur[0];
				const id = cur[2];
				const reminder = cur[3];
				const isRecurring = cur[4];
				// parse time display
				const intHr = parseInt(timeStr.substring(0, 2));
				const intMin = timeStr.substring(2, 4);
				const AMorPM = intHr<12? 'am' : 'pm';
				const displayTimeStr = `${intHr%12==0? 12 : intHr%12}:${intMin} ${AMorPM}`;
				// modify text
				let displayText = `${displayTimeStr} ${title}`;
				if (isRecurring) { displayText = "\u{1F504}" + displayText; }
				if (reminder===1) { displayText = "\u{1F514}"+displayText; }
				let eventNode = document.createElement("p");
				eventNode.textContent = displayText;

				// only allow edit or delete if the user owns this calendar
				// this is also enforced on backend since edit/delete requests will be executed base on the current session user
				if (viewedUser === "yourOwnCalendar") {
					eventNode.setAttribute("class", "event");
					eventNode.setAttribute("id", "event_"+id);
					eventNode.addEventListener("click", showEventOptions, false);
				}
				prev.appendChild(eventNode);

				return prev;
			}, dateStrNode.parentNode);
		}).catch(err => console.log(err));

	});	
}

// display options for edit and delete
function toggleEditEventOptions(e) {
	/*
	Toggles visibility of fields for recurring and non-recurring options
	*/
	e?.preventDefault();
	const isREvent = (e.target.value === "Revent");
	if (isREvent) {
		$("#editEventNonRecurring").hide();
		$("#editEventRecurring").show();
	} else {
		$("#editEventNonRecurring").show();
		$("#editEventRecurring").hide();
	}
}
document.getElementById("editEventTypeSelect").addEventListener("change", toggleEditEventOptions, false);
function showEventOptions(e) {
	e?.preventDefault();
	const id = /^event_(\d+)$/.exec(e.target.id)[1];
	document.getElementById("curID").textContent = id;
	// show dialog
	$("#eventOptionDialog").dialog();
}

// edit
$("#editEvent").click(e => {
	e?.preventDefault();
	const id = document.getElementById("curID").textContent;

	// get input
	const isREvent = document.getElementById("editEventTypeSelect").value === "Revent";
	let inputDate, inputTime, inputTitle, inputEnd, recurOn, inputReminder;
	if (!isREvent) {
		inputDate = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(document.getElementById("eventOption_date").value);
		inputEnd = inputDate;
		inputTime = /^(\d{2}):(\d{2})$/.exec(document.getElementById("eventOption_time").value);
		inputTitle = document.getElementById("eventOption_title").value;
		inputReminder = document.getElementById("eventOption_reminder").value==='1'? 1 : 0;
		recurOn = 127; // Value of binary string 1111111
	} else {
		inputDate = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(document.getElementById("editREvent_start").value);
		inputEnd = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(document.getElementById("editREvent_end").value);
		inputTime = /^(\d{2}):(\d{2})$/.exec(document.getElementById("editREvent_time").value);
		inputTitle = document.getElementById("editREvent_title").value;
		inputReminder = document.getElementById("editREvent_reminder").value==='1'? 1 : 0;
		// process recurrence
		const checkNodes = document.getElementById("editREventRadio").querySelectorAll("[name='editREventRadio'");
		recurOn = [...checkNodes].reduce((prev, cur) => (prev<<1)+(cur.checked), 0);
	}

	// make sure the date str is in the format yyyyymmdd
	if (!inputDate || inputDate.length != 4) { alert("Invalid Date"); return; }
	const inputDateStr = inputDate[1].padStart(5, "0") + inputDate[2] + inputDate[3];
	if (!inputEnd || inputEnd.length != 4) { alert("Invalid Date"); return; }
	const inputEndStr = inputEnd[1].padStart(5, "0") + inputEnd[2] + inputEnd[3];
	// check if end date is later than start date
	if (!(inputEndStr >= inputDateStr)) { alert("End Date Must Be After The Start Date"); return; }

	// make sure the time str is in the format hhmm
	if (!inputTime || inputTime.length != 3) { alert("Invalid Time"); return; }
	const inputTimeStr = inputTime[1] + inputTime[2];
	// sanitize title	
	if (!/^[-\w\s,?!.;'"(){}\[\]]{1,255}$/.exec(inputTitle)) { 
		alert("Title must be 1-255 characters long and can only include letters, numbers and any of the following: _-,?!.;'\"()[]{}");
		return;
	}

	// disallow input that do not recur on any day
	if (recurOn === 0) { alert("Event Must Occur On Some Days!"); return; }

	// We fetch by passing the id to the server, 
	// but the server searches for BOTH the id AND the username of the current session
	// fetch request
	const data = {
		"id": id,
		"title": inputTitle,
		"date": inputDateStr,
		"end": inputEndStr,
		"time": inputTimeStr,
		"recurOn": recurOn,
		"reminder": inputReminder,
		"token": getToken(),
		"type": "edit_event"
	};
	fetch("eventHandler.php", {
		"method": "POST",
		"body": JSON.stringify(data),
		'content-type': "application/json"
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		// if success: hide dialog
		if (result.success) {
			$("#eventOptionDialog").dialog("close");
			resetAllInput();
			updateCalendar();
		}
	})
	.catch(err => console.log(err));
});

// delete
$("#deleteEvent").click(e => {
	e?.preventDefault();
	const id = document.getElementById("curID").textContent;

	// We fetch by passing the id to the server, 
	// but the server searches for BOTH the id AND the username of the current session
	const data = {"id": id, "token": getToken(), "type": "delete_event"};
	fetch("eventHandler.php", {
		"method": "POST",
		"body": JSON.stringify(data),
		'content-type': "application/json"
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		// if success: hide dialog
		if (result.success) {
			$("#eventOptionDialog").dialog("close");
			resetAllInput();
			updateCalendar();
		}
	})
	.catch(err => console.log(err));
});

// Fill Display on Refresh using Current Time
updateCalendar();

// Reset to Today
function resetDisplay() {
	thisMonth = new Month(curTime.getFullYear(), curTime.getMonth());
	updateCalendar();
}

// sign up logic
$("#signupButton").click(e => {
	e?.preventDefault();
	$("#signupDialog").dialog();
});
$("#signupForm").submit(e => {
	e?.preventDefault();
	const username = document.getElementById("signup_username").value;
	if (!/^[\w_\-]{1,12}$/.exec(username)) { alert("Invalid Username!"); return; }
	const password = document.getElementById("signup_password").value;
	if (password.length===0) { alert("Password must not be empty!"); return; }
	const data = {username: username, password: password, token: getToken(), type: "signup"};
	fetch("userHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"content-type": "application/json"
		}
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		if (result.success) {
			$("#signupDialog").dialog("close");
			resetAllInput();
		}
	})
	.catch(err => console.log(err));
});

// sign in logic
$("#signinButton").click(e => {
	e?.preventDefault();
	$("#signinDialog").dialog();
});
$("#signinForm").submit(e => {
	e?.preventDefault();
	const username = document.getElementById("signin_username").value;
	const password = document.getElementById("signin_password").value;
	const data = {username: username, password: password, token: getToken(), type: "signin"};
	fetch("userHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"content-type": "application/json"
		}
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		if (result.success) {
			$("#signinDialog").dialog("close");
			resetAllInput();
		}
		curViewedUser = "yourOwnCalendar";
		updateSignInStatus();
		updateCalendar();
		updateShares();
		updateEmailDisplay();
	})
	.catch(err => console.log(err));
});

// sign out logic
$("#signoutButton").click(e => {
	e?.preventDefault();
	const data = {token: getToken(), type: "signout"};
	fetch("userHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"content-type": "application/json"
		}
	}).then(response => response.json())
	.then(result => {
		if (result.success) {
			document.getElementById('token').textContent = result.token;
		}
		alert(result.msg);
		curViewedUser = "yourOwnCalendar";
		updateSignInStatus();
		updateCalendar();
		updateShares();
		updateEmailDisplay();
	})
	.catch(err => console.log(err));
});

// Month Forward and Backward
$("#lastMonth").click(() => {
	thisMonth = thisMonth.prevMonth();
	updateCalendar();
});
$("#nextMonth").click(() => {
	thisMonth = thisMonth.nextMonth();
	updateCalendar();
});
$("#displayToday").click(() => {
	resetDisplay();
});

// add events
function toggleAddEventOptions(e) {
	/*
	Toggles visibility of fields for recurring and non-recurring options
	*/
	e?.preventDefault();
	const isREvent = (e.target.value === "Revent");
	if (isREvent) {
		$("#addEventNonRecurring").hide();
		$("#addEventRecurring").show();
	} else {
		$("#addEventNonRecurring").show();
		$("#addEventRecurring").hide();
	}
}
document.getElementById("addEventTypeSelect").addEventListener("change", toggleAddEventOptions, false);
// show dialog
$("#addEventButton").click((e) => {
	e?.preventDefault();
	$("#addEventDialog").dialog();
});
$("#addEventForm").submit(e => {
	e?.preventDefault();

	// get input
	const isREvent = document.getElementById("addEventTypeSelect").value === "Revent";
	let inputDate, inputTime, inputTitle, inputEnd, recurOn, inputReminder;
	if (!isREvent) {
		inputDate = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(document.getElementById("addEvent_date").value);
		inputEnd = inputDate;
		inputTime = /^(\d{2}):(\d{2})$/.exec(document.getElementById("addEvent_time").value);
		inputTitle = document.getElementById("addEvent_title").value;
		recurOn = 127; // Value of binary string 1111111
		inputReminder = document.getElementById("addEvent_reminder").value==='1'? 1 : 0;
	} else {
		inputDate = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(document.getElementById("addREvent_start").value);
		inputEnd = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(document.getElementById("addREvent_end").value);
		inputTime = /^(\d{2}):(\d{2})$/.exec(document.getElementById("addREvent_time").value);
		inputTitle = document.getElementById("addREvent_title").value;
		inputReminder = document.getElementById("addREvent_reminder").value==='1'? 1 : 0;
		// process recurrence
		const checkNodes = document.getElementById("addREventRadio").querySelectorAll("[name='addREventRadio'");
		recurOn = [...checkNodes].reduce((prev, cur) => (prev<<1)+(cur.checked), 0);
	}
	
	// make sure the date str is in the format yyyyymmdd
	if (!inputDate || inputDate.length != 4) { alert("Invalid Date"); return; }
	const inputDateStr = inputDate[1].padStart(5, "0") + inputDate[2] + inputDate[3];
	if (!inputEnd || inputEnd.length != 4) { alert("Invalid Date"); return; }
	const inputEndStr = inputEnd[1].padStart(5, "0") + inputEnd[2] + inputEnd[3];
	// check if end date is later than start date
	if (!(inputEndStr >= inputDateStr)) { alert("End Date Must Be After The Start Date"); return; }

	// make sure the time str is in the format hhmm
	if (!inputTime || inputTime.length != 3) { alert("Invalid Time"); return; }
	const inputTimeStr = inputTime[1] + inputTime[2];
	// sanitize title	
	if (!/^[-\w\s,?!.;'"(){}\[\]]{1,255}$/.exec(inputTitle)) { 
		alert("Title must be 1-255 characters long and can only include letters, numbers and any of the following: _-,?!.;'\"()[]{}");
		return;
	}

	// disallow input that do not recur on any day
	if (recurOn === 0) { alert("Event Must Occur On Some Days!"); return; }

	// fetch request
	const data = {
		"title": inputTitle,
		"date": inputDateStr,
		"end": inputEndStr,
		"time": inputTimeStr,
		"recurOn": recurOn,
		"reminder": inputReminder,
		"token": getToken(),
		type: "post_event"
	};
	
	fetch("eventHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"content-type": "application/json"
		}
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		if (result.success) {
			$("#addEventDialog").dialog("close");
			resetAllInput();
			updateCalendar();
		}
	}).catch(err => console.log(err));
	
})

// share calendar dialog
$("#shareButton").click((e) => {
	e?.preventDefault();
	$("#shareDialog").dialog();
});
$("#share").click(e => {
	e?.preventDefault();

	const sharee = document.getElementById("sharee").value;
	if (!/^[\w_\-]{1,12}$/.exec(sharee)) { alert("Invalid Username!"); return; }

	const data = {"sharee": sharee, "type": "add_share", "token": getToken()};
	fetch("sharingHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		"content-type": "application/json"
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		if (result.success) {
			$("#shareDialog").dialog("close");
			resetAllInput();
			updateShares();
		}
	})
	.catch(err => console.log(err));
});

// update sharer and sharee lists
function updateShares() {
	const data = {"type": "get_shares", "token": getToken()};
	fetch("sharingHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		"content-type": "application/json"
	}).then(response => response.json())
	.then(result => {
		// if unsuccessful: abort
		if (!result.success || !result.hasOwnProperty("sharees") || !result.hasOwnProperty("sharers")) {
			return;
		}

		// update sharees
		const sharees = result.sharees;
		let sharingListNode = document.getElementById("sharingList");
		sharingListNode.innerHTML = ""; // initialize
		sharingListNode.textContent = "Stop Sharing With:";
		let sharingListInnerNode = document.createElement("ol");

		sharees.reduce((prev, cur) => {
			const curNode = document.createElement("li");
			curNode.textContent = cur;
			curNode.setAttribute("class", "selectable");
			curNode.addEventListener("click", deleteShare, false);
			prev.appendChild(curNode);
			return prev;
		}, sharingListInnerNode);

		sharingListNode.appendChild(sharingListInnerNode);

		// update sharers
		const sharers = result.sharers;
		let sharedListNode = document.getElementById("sharedListSelect");
		sharedListNode.innerHTML = ""; // initialize
		let optionNode = document.createElement("option");
		optionNode.setAttribute("value", "yourOwnCalendar"); // Since username must be within 12 characters, this value will not be a username
		optionNode.textContent = "Your own calendar";
        sharedListNode.appendChild(optionNode);

		sharers.reduce((prev, cur) => {
			const curNode = document.createElement("option");
			curNode.textContent = cur;
			curNode.setAttribute("value", cur);
			prev.appendChild(curNode);
			return prev;
		}, sharedListNode);
	})
	.catch(err => console.log(err));
}

// update shares on refresh
updateShares();

// delete share
function deleteShare(e) {
	e?.preventDefault();

	const sharee = e.target.textContent;
	if (!/^[\w_\-]{1,12}$/.exec(sharee)) { alert("Invalid Sharee Username!"); return; }

	const data = {"sharee": sharee, "type": "delete_share", "token": getToken()};
	fetch("sharingHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		"content-type": "application/json"
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		if (result.success) {
			updateShares();
		}
	})
	.catch(err => console.log(err));
}

// display shared calendar
document.getElementById("sharedListSelect").addEventListener("change", e => {
	curViewedUser = document.getElementById("sharedListSelect").value;
	updateCalendar();
}, false);

// update email
$("#inputEmailButton").click(e => {
	const email = document.getElementById("inputEmail").value;
	// check if email is valid
	if (!/^[\w!#$%&'*+\/=?^_`{|}~.-]+@([\w\-]+(?:\.[\w\-]+)+)$/.exec(email) || email.length>255) {
		// https://stackoverflow.com/questions/8242567/acceptable-field-type-and-size-for-email-address
		alert("Please Enter a Valid Email Address!");
		return;
	}
	const emailData = {"email": email, "token": getToken(), "type": "setEmail"};
	fetch("userHandler.php", {
		method: "POST",
		body: JSON.stringify(emailData),
		"content-type": "application/json"
	}).then(response => response.json())
	.then(result => {
		alert(result.msg);
		if (result.success) {
			document.getElementById("inputEmail").value = "";
			updateEmailDisplay();
		}
	})
	.catch(err => console.log(err));
});
// retrieve email
function updateEmailDisplay() {
	const emailNode = document.getElementById("displayEmail");
	
	const data = {"token": getToken(), "type": "getEmail"};
	fetch("userHandler.php", {
		method: "POST",
		body: JSON.stringify(data),
		"content-type": "application/json"
	}).then(response => response.json())
	.then(result => {
		if (result.success) {
			emailNode.textContent = `Your current email: ${result.email}`;
		}
	})
	.catch(err => console.log(err));
}
// update on refresh
updateEmailDisplay();