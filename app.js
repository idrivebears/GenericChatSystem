
 /*
    GENERIC CHAT SYSTEM v0.0.1
    
    by Alex Walls
 */
 var express = require('express');
 var app = express();
 var serv = require('http').Server(app);
 
 /**
  * Missing functionality:
  * - Improve chat history(save names and server messages)
  * - Add visible client list (click to DM)
  * - Add color customization
  * - Prettify code (redo everything pretty much)
  * - Generalize message system (have message types for system messages, commands, user messages etc)
  * - Add private messages
  */

 app.get('/', function(req, res){
     res.sendFile(__dirname + '/client/index.html');
 });
 app.use('/client', express.static(__dirname + '/client'));

 serv.listen(2000);
 console.log("Server running.");

 // Stores all clients connected to the server
 var CLIENT_LIST = [];
 
 // Stores chat history for all clients
 var CHAT_HISTORY = [];

 var io = require('socket.io')(serv,{});
 io.sockets.on('connection', function(socket) {

     socket.id = CLIENT_LIST.length;
     socket.nickname = "Guest" + socket.id;
     
     CLIENT_LIST[socket.id] = socket;

     console.log("new socket connection");
     
     CHAT_HISTORY.forEach(function(element) {
         socket.emit("newMessage", {
            text: element   
         });
     }, this);


     ///////// Handle incoming message from a client and resend to all clients
     socket.on('incomingMessage', function(message) {
         console.log("New message received. [cid=" + socket.id + "][nick=" + socket.nickname + "]");
         console.log("Message contents: " + message.text);
         CHAT_HISTORY.push(message.text);
         broadCastMessage(socket.nickname, message.text, "color:black");
     });

     socket.on('setNick', function(data) {
        console.log("Assigning new nick to [cid=" + socket.id + "][nick=" + socket.nickname + "]"); 
        broadCastMessage("SYSTEM: ", socket.nickname + " has changed his name to " + data.nickname, "color:blue");
        socket.nickname = data.nickname;
        
     });
     
     socket.on('disconnect', function(data){
        console.log("Client disconnected from server.");
        broadCastMessage("SYSTEM: ","User " + socket.nickname + " has disconnected.", "color:blue");
     });

 });

 ///////// Send new chat to all connected clients
 var broadCastMessage = function(clientName, message, style) {
     for(var i in CLIENT_LIST) {
         // Do something with each client
         CLIENT_LIST[i].emit('newMessage', {
             client: clientName,
             text: message,
             style: style
         });
     }
 }
