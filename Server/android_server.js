var http=require('http');
var express=require('express');
var app=express();
var socketio=require('socket.io');

var connect={};
var server=http.createServer(app).listen(3000,function(){
    console.log("Success Connection: 3000");
});

var io=socketio.listen(server);
io.sockets.on('connection',function(socket){
    console.log('socket연결됨');
    
    socket.on('socket_id',function(data){
        connect[data]=socket.id;
        console.log(socket.id);
    });
    socket.on('message',function(message){
        console.log(message);
        io.to(connect[message.sender_id]).emit('message',{name:"나",message:message.message});
        io.to(connect[message.listener_id]).emit('message',{name:message.sender_id, message:message.message});
    });
});
io.sockets.on('disconnection',function(){
    console.log('socket연결이 해제됨.');
});
