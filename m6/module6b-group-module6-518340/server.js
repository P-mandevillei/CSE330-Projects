// reference: https://socket.io/docs/v4/tutorial

import http from 'http';
import fs from "fs";
import { Server } from 'socket.io';
import mime from 'mime';
import path from 'path';
import url from 'url';
import bcrypt from 'bcrypt';
import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';

const port = 3456;
const file = 'chat.html';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// static files we need to serve
const allowed_static_filepaths = ['/chat.css', '/chat.js', '/obscenity.bundle.js'];

// file server
console.log(`Starting server running at http://localhost:${port}`);
const server = http.createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    const filename = path.join(__dirname, pathname);
    
    if (allowed_static_filepaths.includes(pathname)) {
        fs.readFile(filename, (err, data) => {
            if (err) {return res.writeHead(500)};
            const mimetype = mime.getType(filename);
            res.writeHead(200, {
                "Content-Type": mimetype
            });
            res.end(data);
        })
    }
    else {
        fs.readFile(file, (err, data) => {
            if (err) {return res.writeHead(500)};
            res.writeHead(200);
            res.end(data);
        })
    }
});
server.listen(port);

// create socket io server
const io = new Server(server, {
    connectionStateRecovery: {}
});

function check_username(username) {
    return /^[\w_\-]{1,12}$/.exec(username);
}

// hashing and compare function referenced from ChatGPT
async function hashPassword(password) {
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}
async function comparePasswords(password, hash) {
    return await bcrypt.compare(password, hash);
}

// array to store all the info
let chatrooms = [];
let users = {};

// keep a unique id of every message and their sent time
let msg_id = 0;
let msg_times = []; // contains {username, time}
const unsendTimeMs = 1*60*1000;

console.log("Synchronizing data...");
// read data; synchronously!
// https://stackoverflow.com/questions/64655643/how-to-read-write-to-a-json-file-in-node-js
let chatroomsRaw = fs.readFileSync('chatrooms.json');
chatrooms= JSON.parse(chatroomsRaw).chatrooms;
// discard the users data
chatrooms = chatrooms.map(cur => { cur.users=[]; return cur;});

console.log("Ready to connect!");
io.on('connection', (socket) => {

    let cur_roomid = false;
    let cur_username = false;

    // https://www.npmjs.com/package/obscenity
    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });

    // log in
    socket.on("cs_userLoggedIn", (data, callback) => {
        // check if username is valid
        if (!check_username(data.username)) {
            socket.emit("error", "Please enter a valid username containing only letters, numbers, dash or underscore within length of 12");
            callback({status: "error"});
            return;
        }
        // update username
        cur_username = data.username;
        // update users
        if (users.hasOwnProperty(data.username)) {
            users[data.username].push(data.socket_id);
        } else {
            users[data.username] = [data.socket_id];
        }

        callback({status: "success"});
    });

    // synchronize all rooms on log in
    socket.on("initialize_rooms", () => {
        for (let object of chatrooms) {
            socket.emit("sc_createRoom", object);
        }
    });

    // create a new room
    socket.on("cs_createRoom", data => {
        data.id = chatrooms.length;
        data.users = [];
        data.banned_users = [];
        data.filter = false;
        if (data.type=='public') {
            data.password = false;
            chatrooms.push(data);
            io.emit("sc_createRoom", data);
            // update chatrooms json file
            // https://stackoverflow.com/questions/64655643/how-to-read-write-to-a-json-file-in-node-js
            fs.writeFile('chatrooms.json', JSON.stringify({"chatrooms": chatrooms}), (err) => {
                if (err) {console.log(err);}
                else {console.log("New room saved.");}
            });
        }
        else {
            hashPassword(data.password).then((hash) => {
                data.password = hash;
                chatrooms.push(data);
                io.emit("sc_createRoom", data);
                // update chatrooms json file
                // https://stackoverflow.com/questions/64655643/how-to-read-write-to-a-json-file-in-node-js
                fs.writeFile('chatrooms.json', JSON.stringify({"chatrooms": chatrooms}), (err) => {
                    if (err) {console.log(err);}
                    else {console.log("New room saved.");}
                });
            })
        }
        
    });

    // join chat
    socket.on("joinChat", (data, callback) => {
        const roomid = data.roomid;
        const cur_room = chatrooms[parseInt(roomid)];

        // check blacklist
        if (cur_room.banned_users.includes(cur_username)) {
            socket.emit("error", "You are banned from this chat!");
            callback({status: 'error'});
            return;
        }

        if (chatrooms[parseInt(roomid)].type==='private') {
            comparePasswords(data?.password ?? "", chatrooms[parseInt(roomid)].password).then(result => {
                if (!result) {
                    socket.emit("error", "Incorrect password");
                    callback({status: 'error'});
                    return;
                }
                // only join if not already in
                if (!socket.rooms.has(roomid)) {
                    socket.join(roomid);
                } else {
                    socket.emit("error", "You are already in this chat!");
                    callback({status: 'error'});
                    return;
                }

                // update user's list
                if (!(chatrooms[parseInt(roomid)].users.includes(cur_username))) {
                    chatrooms[parseInt(roomid)].users.push(cur_username);
                }
                // update roomid
                cur_roomid = roomid;
                io.to(roomid).emit("sc_room_info", chatrooms[parseInt(roomid)]);
                callback({status: 'success', data: cur_room});
            });
        }

        else if (chatrooms[parseInt(roomid)].type==='public') {
            // only join if not already in
            if (!socket.rooms.has(roomid)) {
                socket.join(roomid);
            } else {
                socket.emit("error", "You are already in this chat!");
                callback({status: 'error'});
                return;
            }
            
            // update user's list
            if (!(chatrooms[parseInt(roomid)].users.includes(cur_username))) {
                chatrooms[parseInt(roomid)].users.push(cur_username);
            }
            // update roomid
            cur_roomid = roomid;
            io.to(roomid).emit("sc_room_info", chatrooms[parseInt(roomid)]);
            callback({status: 'success', data: cur_room});
        }

    });

    // leave chat
    socket.on("leaveChat", data => {
        const roomid = data.roomid;
        // check if is in the room
        if (socket.rooms.has(roomid)) {
            socket.leave(roomid);
        } else {
            // maybe the user was kicked out earlier
            return;
        }

        // remove user (but cautiously: user may have logged in with multiple sockets)
        chatrooms[parseInt(roomid)].users = chatrooms[parseInt(roomid)].users.filter(cur => {
                return users[cur]?.some(cur => io.sockets.sockets.get(cur)?.rooms.has(roomid));
            }
        );
        cur_roomid = false;
        // update message
        io.to(roomid).emit("sc_room_info", chatrooms[parseInt(roomid)]);

    });

    // send message
    socket.on("cs_msg", data => {
        const username = cur_username;
        const msg = data.msg;
        const roomid = data.roomid;
        if (msg.length==0) {
            socket.emit("error", "Please type something before you hit send!");
            return;
        }
        // refuse not signed in users
        if (!users.hasOwnProperty(username)) {
            socket.emit("error", "Please first sign in!");
            return;
        }
        // check if joined room
        if (!socket.rooms.has(roomid)) {
            socket.emit("error", "You cannot message to a room you have not joined!");
            return;
        }
        let msg_body = msg;
        // censor message
        if (chatrooms[parseInt(cur_roomid)].filter) {
            const censor = new TextCensor();
            const matches = matcher.getAllMatches(msg_body);
            msg_body = censor.applyTo(msg_body, matches);
        }

        // if public: broadcast message
        if (data.type === 'public') {
            io.to(roomid).emit("sc_msg", {"type": "public", "username": username, "msg": msg_body, "msg_id": msg_id});
            let cur_time = new Date();
            msg_times.push({"username": username, "time": cur_time.getTime()});
            msg_id = msg_id+1;
            return;
        } 
        // private
        else {
            const receiver = data.receiver;
            // check if receiver is valid
            if (!users.hasOwnProperty(receiver)) {
                socket.emit("error", "Receiver does not exist!");
                return;
            }

            // send to receiver
            const receiver_socket_ids = users[receiver];
            let ifSent = false;
            for (let socket_id of receiver_socket_ids) {
                // check if receiver is in the same room
                if (io.sockets.sockets.get(socket_id).rooms.has(roomid)) {
                    io.to(socket_id).emit("sc_msg", {"type": "private", "username": username, "receiver": receiver, "msg": msg_body, "msg_id": msg_id});
                    ifSent = true;
                }
            }
            if (!ifSent) {
                socket.emit("error", "Receiver is not in the same room!");
                return;
            } else {
                // display on sender's page too
                if (receiver !== username) {
                    socket.emit("sc_msg", {"type": "private", "username": username, "receiver": receiver, "msg": msg_body, "msg_id": msg_id});
                }
                let cur_time = new Date();
                msg_times.push({"username": username, "time": cur_time.getTime()});
                msg_id = msg_id+1;
            }
        }
    });

    // kick user out of the a room
    socket.on("kickout", (data, callback) => {
        const initiator = data.initiator;
        const target = data.target;
        const roomid = data.roomid;
        const type = data.type;

        const room = chatrooms[parseInt(roomid)];

        // check if initiator is the owner of the room
        if (room.username !== initiator) {
            socket.emit("error", "You do not have permission of this action!");
            callback({status: 'error'});
            return;
        }
        // cannot kick out yourself
        if (initiator === target) {
            socket.emit("error", "You cannot kick yourself out!");
            callback({status: 'error'});
            return;
        }
        // check if they are in the same room
        // initiator is the current socket
        if (!socket.rooms.has(roomid)) {
            socket.emit("error", "You cannot kick someone out of a room they (or yourself) did not join!");
            callback({status: 'error'});
            return;
        }

        // update active sockets
        // users[target] = users[target].filter(cur => io.sockets.sockets.has(cur));
        // users[target] is an array of socket ids
        const target_socket_ids = users[target].filter(cur => {
            const cur_socket = io.sockets.sockets.get(cur);
            // if in the same room
            return cur_socket?.rooms.has(roomid);
        });
        // if no target found: return
        if (target_socket_ids.length===0) {
            socket.emit("error", "You cannot kick someone out of a room they (or yourself) did not join!");
            callback({status: 'error'});
            return;
        }
        const target_sockets = target_socket_ids.map(cur => io.sockets.sockets.get(cur));

        // kick target out of the room and inform them
        target_sockets.map(cur_socket => {
            cur_socket?.leave(roomid);

            if (type === 'kickout') {
                cur_socket?.emit("kickout", {"type": "kickout"});
            } else {
                cur_socket?.emit("kickout", {"type": "block"});
            }
        });

        // add to blacklist
        if (type === 'block') {
            chatrooms[parseInt(roomid)].banned_users.push(target);
            // update chatrooms json file
            // https://stackoverflow.com/questions/64655643/how-to-read-write-to-a-json-file-in-node-js
            fs.writeFile('chatrooms.json', JSON.stringify({"chatrooms": chatrooms}), (err) => {
                if (err) {console.log(err);}
                else {console.log("User permissions updated.");}
            });
        }

        // remove user directly
        chatrooms[parseInt(roomid)].users = chatrooms[parseInt(roomid)].users.filter(cur => cur !== target);
        cur_roomid = false;
        // update message
        io.to(roomid).emit("sc_room_info", chatrooms[parseInt(roomid)]);

        callback({status: 'success'});
        
    });

    // disconnect user
    socket.on("disconnect", reason => {
        // update active sockets of users
        if (cur_username) {
            users[cur_username] = users[cur_username].filter(cur => (cur!=socket.id) && io.sockets.sockets.has(cur));
            if (users[cur_username].length === 0) {
                delete users[cur_username];
            }
        }
        // filter chatrooms for active users
        if (cur_roomid) {
            chatrooms[parseInt(cur_roomid)].users = chatrooms[parseInt(cur_roomid)].users.filter(
                cur => users.hasOwnProperty(cur) && users[cur].length>0);
            io.to(cur_roomid).emit("sc_room_info", chatrooms[parseInt(cur_roomid)]);
        }
        cur_username = false;
        cur_roomid = false;
    });

    // unsend message
    socket.on("cs_unsend", data => {
        const msgId = data.msgId;
        const roomid = data.roomid;

        const date = new Date();
        const now = date.getTime();
        const msgUsername = msg_times[msgId].username;
        const msgTime = msg_times[msgId].time;

        // check if sender is the current user
        if (msgUsername !== cur_username) {
            socket.emit("error", "You cannot unsend other's messages!");
            return;
        }
        // check time out
        if (!(msgTime+unsendTimeMs>=now && msgTime<=now)) {
            socket.emit("error", "You can no longer unsend a message after 1 minute.");
            return;
        }
        // check if user is in room
        if (roomid !== cur_roomid) {
            socket.emit("error", "You cannot unsend a message in another room!");
            return;
        }

        // broadcast unsend; works for private messages as well since it's based on id
        io.to(cur_roomid).emit("sc_unsend", {'msgId': msgId});

    });

    // if owner turns filter on: broadcast to all users
    socket.on("cs_filter_status", data => {
        // check if the current user is in a room and is the owner
        if (cur_roomid && cur_username===chatrooms[parseInt(cur_roomid)].username) {
            // update filter status
            chatrooms[parseInt(cur_roomid)].filter = data.isOwnerFilterOn;
            // broadcast
            io.to(cur_roomid).emit("sc_filter_status", data);
            
            // update chatrooms json file
            // https://stackoverflow.com/questions/64655643/how-to-read-write-to-a-json-file-in-node-js
            fs.writeFile('chatrooms.json', JSON.stringify({"chatrooms": chatrooms}), (err) => {
                if (err) {console.log(err);}
                // else {console.log("Filter settings updated.");}
                // creates too much output, so disabled for now
            });
        } else {
            socket.emit("error", "You do not have the permission for this action!");
        }
    });

})