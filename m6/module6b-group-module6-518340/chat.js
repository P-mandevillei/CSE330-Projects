const socket = io();
// Obscenity filter; reference: https://www.npmjs.com/package/obscenity
const {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} = require('obscenity');
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

let username = false;
let chatroom = false;
let chatroom_owner = false;
let isFilterOn = false; // is obscenity filter on

const unsendTimeMs = 1*60*1000;

function reset() {
    [...document.getElementsByTagName("input")].map(node => {
		if (node.getAttribute("type")!="submit") {
			node.value = "";
		}
	});
}

function check_username(username) {
    return /^[\w_\-]{1,12}$/.exec(username);
}

function check_signin() {
    return !(username===false);
}

// sign in
$("#nicknameBtn").click((e) => {
    e?.preventDefault();
    const nickname = document.getElementById("nickname_input").value;
    // ensure username is valid
    if (!check_username(nickname)) {
        alert("Please enter a valid username containing only letters, numbers, dash or underscore within length of 12");
        return;
    }
    socket.timeout(5000).emit("cs_userLoggedIn", {"username": nickname, "socket_id": socket.id}, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            if (response.status === 'success') {
                username = nickname;
                // clear current room display
                document.getElementById("room_display").innerHTML = "";
                // update users on server side
                socket.emit("initialize_rooms");
                // update welcome message
                const welcomeNode = document.getElementById("welcome");
                welcomeNode.innerHTML = "";
                welcomeNode.textContent = `Welcome, ${username}!`;
                
                reset();
                $("#nickname").hide();
                $(".showAfterSignIn").show();
            }
        }
    });
    
});

// toggle display of room password field
$('#roomType').change(e => {
    e?.preventDefault();

    const roomType = document.getElementById("roomType").value;
    if (roomType === "private") {
        $("#roomPassword").show();
    } else {
        $("#roomPassword").hide();
    }
});

// create new room
$("#createRoomBtn").click(e => {
    e?.preventDefault();
    if (!check_signin()) {
        alert("You did not sign in!");
        return;
    }
    const roomType = document.getElementById("roomType").value;
    const roomname = document.getElementById("createRoom").value;
    if (roomType==='public') {
        if (roomname.length>0) {
            socket.emit("cs_createRoom", {"type": "public", "roomname": roomname, "username": username});
        }
    } else {
        const password = document.getElementById("roomPassword").value;
        if (password.length==0) {
            alert("Please enter some value for your password!");
            return;
        }
        socket.emit("cs_createRoom", {"type": "private", "roomname": roomname, "username": username, "password": password});
    }
    reset();
});

// append new room
socket.on("sc_createRoom", data => {
    const roomDisplayNode = document.getElementById("room_display");
    const colNode = document.createElement("div");
    // create bootstrap column
    colNode.setAttribute("class", "room_grid col-sm-6 col-md-4 col-lg-3 col-xl-2 bg-light border");
    colNode.textContent = `${data.type==='private'? '\u{1F512}':''} Room ${data.id}`;

    // append room name
    const roomnameNode = document.createElement('div');
    roomnameNode.setAttribute("class", "roomname_display selectable");
    roomnameNode.textContent = data.roomname;
    colNode.appendChild(roomnameNode);

    // add username handle
    const usernameNode = document.createElement('div');
    usernameNode.setAttribute("class", "room_username handle");
    usernameNode.textContent = data.username;

    colNode.appendChild(usernameNode);
    colNode.setAttribute("id", data.id);

    // add password handle
    if (data.type === 'private') {
        const passwordNode = document.createElement('input');
        passwordNode.setAttribute("class", "room_password handle");
        passwordNode.setAttribute('type', 'password');
        passwordNode.setAttribute('placeholder', 'password');
        passwordNode.setAttribute('name', 'password');
        
        const btnNode = document.createElement("button");
        btnNode.setAttribute("class", "roomPasswordBtn handle");
        btnNode.textContent = "Submit Password";
        btnNode.addEventListener("click", submitRoomPassword, false);

        colNode.appendChild(passwordNode);
        colNode.appendChild(btnNode);
    }

    roomDisplayNode.appendChild(colNode);

    // bind event listeners
    if (data.type === 'public') {
        roomnameNode.addEventListener("click", enterChat, false);
    } else {
        roomnameNode.addEventListener("click", showPassword, false);
    }
    
});

// display password field for private rooms
function showPassword(e) {
    e?.preventDefault();
    const target = e.target.parentNode;
    const passwordNode = target.querySelectorAll(".room_password")[0];
    const btnNode = target.querySelectorAll(".roomPasswordBtn")[0];
    $(passwordNode).toggle();
    $(btnNode).toggle();
}

// submit room password
const submitRoomPassword = (e) => {
    e?.preventDefault();
    const target = e.target.parentNode;
    const password = target.querySelectorAll(".room_password")[0].value;
    const target_roomid = target.getAttribute('id');

    // ask server to join chat
    socket.timeout(5000).emit("joinChat", {"roomid": target_roomid, "password": password}, (err, response) => {
        if (err) {
            console.log(err);
        }
        else if (response.status === 'success') {
            // hide password input
            const passwordNode = target.querySelectorAll(".room_password")[0];
            $(passwordNode).hide();
            const btnNode = target.querySelectorAll(".roomPasswordBtn")[0];
            $(btnNode).hide();
            reset();

            const target_username = response.data.username;
            const target_roomname = response.data.roomname;
            const isOwnerFilterOn = response.data.filter;

            display_current_room(target_roomid, target_roomname, target_username, isOwnerFilterOn);

            // update current room info
            chatroom = target_roomid;
            chatroom_owner = target_username;
        }
    });
};

function enterChat(e) {
    e?.preventDefault();
    // refuse not signed in users
    if (!check_signin()) {
        alert("You did not sign in!");
        return;
    }
    // cannot double enjoy
    if (chatroom!==false) {
        alert("Please leave your current room first!");
        return;
    }
    // get room info
    const target = e.target.parentNode;
    const target_roomid = target.getAttribute('id');
    // ask server to join chat
    socket.timeout(5000).emit("joinChat", {"roomid": target_roomid}, (err, response) => {
        if (err) {
            console.log(err);
        }
        else if (response.status == 'success') {
            const target_username = response.data.username;
            const target_roomname = response.data.roomname;
            const isOwnerFilterOn = response.data.filter;

            display_current_room(target_roomid, target_roomname, target_username, isOwnerFilterOn);

            // update current room info
            chatroom = target_roomid;
            chatroom_owner = target_username;
        }
    });
}

function display_current_room(target_roomid, target_roomname, target_username, isOwnerFilterOn) {
    // toggle display
    $(".showBeforeEnteringRoom").hide();
    $(".showAfterEnteringRoom").show();
    // initialize
    const titleNode = document.getElementById("roomTitle");
    const msgNode = document.getElementById("displayMsg");
    titleNode.innerHTML = "";
    msgNode.innerHTML = "";
    const kickoutNode = document.getElementById("kickoutMsg");
    $(kickoutNode).hide();
    // display current room
    const headNode = document.createElement("div");
    headNode.setAttribute("class", "roomIdHeader");
    headNode.textContent = "Room "+target_roomid;
    const roomnameNode = document.createElement('div');
    roomnameNode.setAttribute("class", "roomnameHeader");
    roomnameNode.textContent = `${target_roomname} (owned by ${target_username})`;
    titleNode.appendChild(headNode);
    titleNode.appendChild(roomnameNode);

    // update filter status
    document.getElementById("ownerFilterBtn").checked = isOwnerFilterOn;
    const filterNode = document.getElementById("isOwnerFilterOn");
    if (isOwnerFilterOn) {
        filterNode.textContent = "The room owner has turned the obscenity filter on.";
    } else {
        filterNode.innerHTML = "";
    }
    if (username === target_username) {
        $("#ownerFilter").show();
    } else {
        $("#ownerFilter").hide();
    }
}

$("#leaveRoom").click(e => {
    e?.preventDefault();
    // refuse not signed in users
    if (!check_signin()) {
        alert("You did not sign in!");
        return;
    }
    $(".showBeforeEnteringRoom").show();
    $(".showAfterEnteringRoom").hide();
    // if the user is not in a chatroom: do nothing
    if (chatroom === false) {
        return;
    }
    // leave the chat
    socket.emit("leaveChat", {"roomid": chatroom, "username": username});
    chatroom = false;
    chatroom_owner = false;
});

// update the active user's list
socket.on("sc_room_info", data => {
    const userNode = document.getElementById("roomUsers");
    userNode.innerHTML = "";
    userNode.textContent = "Active users: ";
    data.users.reduce((prev, cur) => {
        const emptyNode = document.createElement("span");
        emptyNode.textContent = " \u{2764}";
        const spanNode = document.createElement("span");
        spanNode.textContent = cur;
        if (data.username === username) {
            spanNode.setAttribute("class", "userList selectable");
            spanNode.addEventListener("click", userOptions, false);
        } else {
            spanNode.setAttribute("class", "userList");
        }
        prev.appendChild(emptyNode);
        prev.appendChild(spanNode);

        return prev;
    }, userNode);
});

// display dialog of kicking users out
const userOptions = (e) => {
    e?.preventDefault();
    const target_username = e.target.textContent;
    if (chatroom_owner !== username) {
        alert("You do not have the permission for this operation!");
        return;
    }
    document.getElementById("userOptionsTitle").textContent = `What do you want to do with ${target_username}?`;
    document.getElementById("target_username").textContent = target_username;
    document.getElementById("target_roomid").textContent = chatroom;
    $("#userOptions").dialog();
};


$("#kickout").click(e => {
    e?.preventDefault();
    if (chatroom_owner !== username) {
        alert("You do not have the permission for this operation!");
        return;
    }
    const target_username = document.getElementById("target_username").textContent;
    if (username === target_username) {
        alert("You cannot kick yourself out!");
        return;
    }
    const roomid = document.getElementById("target_roomid").textContent;
    socket.timeout(5000).emit("kickout", {"type": "kickout", "initiator": username, "target": target_username, "roomid": roomid}, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            alert(`${target_username} has been kicked out!`);
            $("#userOptions").dialog("close");
        }
    });
});

// kick out message
socket.on("kickout", data => {
    const type = data.type;
    // clean the page
    const userNode = document.getElementById("roomUsers");
    userNode.innerHTML = "";
    const msgNode = document.getElementById("displayMsg");
    msgNode.innerHTML = "";
    // alert user
    const kickoutNode = document.getElementById("kickoutMsg");
    if (type == "kickout") {        
        kickoutNode.textContent = "YOU HAVE BEEN KICKED OUT BY THE GROUP MANAGER. PLEASE LEAVE THE ROOM.";
    } else {
        kickoutNode.textContent = "YOU HAVE BEEN PERMANENTLY BLOCKED BY THE GROUP MANAGER. PLEASE LEAVE THE ROOM.";
    }
    $(kickoutNode).show();
});

$("#block").click(e => {
    e?.preventDefault();
    if (chatroom_owner !== username) {
        alert("You do not have the permission for this operation!");
        return;
    }
    const target_username = document.getElementById("target_username").textContent;
    if (username === target_username) {
        alert("You cannot kick yourself out!");
        return;
    }
    const roomid = document.getElementById("target_roomid").textContent;
    socket.timeout(5000).emit("kickout", {"type": "block", "initiator": username, "target": target_username, "roomid": roomid}, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            alert(`${target_username} has been kicked out and permanently blocked!`);
            $("#userOptions").dialog("close");
        }
    });
});

// error messages
socket.on("error", msg => {
    alert(msg);
});

// send message
$("#sendMsgBtn").click(e => {
    e?.preventDefault();
    // refuse not signed in users
    if (!check_signin()) {
        alert("You did not sign in!");
        return;
    }

    const msg = document.getElementById("sendMsg").value;
    // refuse empty message
    if (msg.length==0) {
        alert("Please type something before you hit send!");
        return;
    }

    // get msg type
    const msgType = document.getElementById("msgType").value;
    // public
    if (msgType === 'public') {
        socket.emit("cs_msg", {"type": "public", "roomid": chatroom, "msg": msg});
    }
    // private
    else {
        const receiver = document.getElementById("msgReceiver").value;
        if (!check_username(receiver)) {
            alert("Please enter a valid username for the receiver");
            return;
        }
        socket.emit("cs_msg", {
            "type": "private", "roomid": chatroom, "msg": msg, "receiver": receiver
        });
    }
    
    reset();
});

// toggle display of private message receiver field
$('#msgType').change(e => {
    e?.preventDefault();

    const msgType = document.getElementById("msgType").value;
    if (msgType === "private") {
        $("#msgReceiver").show();
    } else {
        $("#msgReceiver").hide();
    }
});

// update message displays
socket.on("sc_msg", data => {
    const msgNode = document.getElementById("displayMsg");
    const divNode = document.createElement('div');
    
    const usernameNode = document.createElement("span");
    if (data.type === 'private') {
        usernameNode.textContent = `[private] ${data.username===username? "you": data.username} to ${data.receiver===username? "you": data.receiver}: `;
    } else {
        usernameNode.textContent = data.username+": ";
    }
    usernameNode.setAttribute("class", "msg_username");

    // message body
    let msgBody = data.msg;
    const msgContentNode = document.createElement("span");
    msgContentNode.setAttribute("class", "msg_content");
    // if filter on: censor
    // reference: https://www.npmjs.com/package/obscenity
    if (isFilterOn) {
        const censor = new TextCensor();
        const matches = matcher.getAllMatches(msgBody);
        msgBody = censor.applyTo(msgBody, matches);
    }

    msgContentNode.textContent = msgBody;

    divNode.setAttribute("id", `msg_${data.msg_id}`);
    divNode.appendChild(usernameNode);
    divNode.appendChild(msgContentNode);
    // add unsend function
    if (data.username === username) {
        const unsendNode = document.createElement('span');
        unsendNode.textContent = "unsend";
        unsendNode.setAttribute("class", "selectable");
        setTimeout(() => $(unsendNode).hide(), unsendTimeMs);
        unsendNode.addEventListener("click", unsendMsg, false);
        divNode.appendChild(unsendNode);
    }

    msgNode.appendChild(divNode);
});

// unsend request
function unsendMsg(e) {
    e?.preventDefault();

    const divNode = e.target.parentNode;
    const msgId = parseInt(divNode.getAttribute("id").split("_")[1]);
    socket.emit("cs_unsend", {"msgId": msgId, "roomid": chatroom});
}

// unsend message
socket.on("sc_unsend", data => {
    const msgId = data.msgId;
    const msgNode = document.getElementById(`msg_${msgId}`);
    msgNode?.remove();
});

// toggle obscenity filter
$("#obscenityFilter").change((e) => {
    e?.preventDefault();

    isFilterOn = (document.getElementById("obscenityFilter").value === 'on');
});

// turn filter on for all users in the room
$("#ownerFilterBtn").change((e) => {
    e?.preventDefault;

    // check if the current user is the owner of this room
    if (username !== chatroom_owner) {
        alert("You do not have the permission for this action!");
        return;
    }
    const isOwnerFilterOn = document.getElementById("ownerFilterBtn").checked;
    socket.emit("cs_filter_status", {"isOwnerFilterOn": isOwnerFilterOn});
});

// if the owner has changed the filter status
socket.on("sc_filter_status", data => {
    document.getElementById("ownerFilterBtn").checked = data.isOwnerFilterOn;
    const filterNode = document.getElementById("isOwnerFilterOn");
    if (data.isOwnerFilterOn) {
        filterNode.textContent = "The room owner has turned the obscenity filter on.";
    } else {
        filterNode.innerHTML = "";
    }
});