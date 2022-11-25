/*
 * Video reference: https://www.youtube.com/watch?v=Uk5DbEnFNP0
 * Code reference: https://github.com/coding-with-chaim/toggle-cam-final
 */

const express = require('express');
const app = express();
const http = require('http');
const {
    Server
} = require('socket.io');
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

app.get('/room/:roomId', (req, res) => {
    res.sendFile(`${__dirname}/public/room.html`);
});

io.on('connection', socket => {
    socket.on('user joined room', roomId => {
        const room = io.sockets.adapter.rooms.get(roomId);

        if (room && room.size === 4) {
            socket.emit('server is full');
            return;
        }

        const otherUsers = [];

        if (room) {
            room.forEach(id => {
                otherUsers.push(id);
            })
        }

        socket.join(roomId);
        socket.emit('all other users', otherUsers);
    });

    socket.on('peer connection request', ({
        userIdToCall,
        sdp
    }) => {
        io.to(userIdToCall).emit("connection offer", {
            sdp,
            callerId: socket.id
        });
    });

    socket.on('connection answer', ({
        userToAnswerTo,
        sdp
    }) => {
        io.to(userToAnswerTo).emit('connection answer', {
            sdp,
            answererId: socket.id
        })
    });

    socket.on('ice-candidate', ({
        target,
        candidate
    }) => {
        io.to(target).emit('ice-candidate', {
            candidate,
            from: socket.id
        });
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            socket.to(room).emit('user disconnected', socket.id);
        });
    });






    socket.join(socket.user);
    console.log("SOCKET USER: " + socket.user)

    socket.on('call', (data) => {
        let callee = data.name;
        let rtcMessage = data.rtcMessage;

        socket.to(callee).emit("newCall", {
            caller: socket.user,
            rtcMessage: rtcMessage
        })

    })

    socket.on('answerCall', (data) => {
        let caller = data.caller;
        rtcMessage = data.rtcMessage

        socket.to(caller).emit("callAnswered", {
            callee: socket.user,
            rtcMessage: rtcMessage
        })

    })

    socket.on('ICEcandidate', (data) => {
        let otherUser = data.user;
        let rtcMessage = data.rtcMessage;

        socket.to(otherUser).emit("ICEcandidate", {
            sender: socket.user,
            rtcMessage: rtcMessage
        })
    })

});



// // Connects to a database and creates a table if needed
// async function initializeDatabase() {
//     const mysql = require("mysql2/promise");
//     let connection;
//     let createDatabaseTables;

//         connection = await mysql.createConnection({
//             host: "localhost",
//             user: "root",
//             password: "",
//             multipleStatements: true
//         });
//         createDatabaseTables = `CREATE DATABASE IF NOT EXISTS 3940WebRTC;
//         use 3940WebRTC;
//         CREATE TABLE IF NOT EXISTS 3940Users(
//         id int NOT NULL AUTO_INCREMENT, 
//         username VARCHAR(20),  
//         password VARCHAR(30), 
//         PRIMARY KEY (id));`;

//     // Creates a table for users
//     await connection.query(createDatabaseTables);
// }


// Server runs on the port below
let port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log('server is running on port ' + port)
    // initializeDatabase();
});