const path = require('path')
const express = require('express');
const http = require('http');
const socketio = require('socket.io')
const formatMessage = require('./utils/message');
const {
     userJoin,
      getCurrentUser, 
      userLeave, 
      getRoomUsers 
    } = require('./utils/users');

const PORT = 4004
const app = express();

const server = http.createServer(app)
const io = socketio(server)

// Static folder
app.use(express.static(path.join(__dirname, 'public')));


const botName = 'HeartyApp';

// New User Connection 
io.on('connection', socket =>{
    console.log('New WS Connected');

    socket.on('joinRoom', ({ username, room}) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

          // Message to User
    socket.emit("message", formatMessage(botName, 'Welcome to HeartyChat!'));

    //Message to room when usser joins
    socket.broadcast.
    to(user.room)
    .emit('message', formatMessage(botName, `${user.username} has joined the chat`));

    // send user and room info
    io.to(user.room).emit('userRoom', {
        room: user.room,
        users: getRoomUsers(user.room)
    });

    // ChatMessage 
    socket.on('chatMessage', msg => {

        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

   

  
    


    //Message to room when user leaves the room
    socket.on('disconnect', () => {

        const user = userLeave(socket.id);

        if (user){

            io.to(user.room).emit("message", formatMessage(botName,
                 `${user.username} has left the chat`));
        }

        // send user and room info
    io.to(user.room).emit('userRoom', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
    
    });
});

});


// Server
server.listen(PORT, () => {
    console.log(`Server  is runnuing on ${PORT}`)
});