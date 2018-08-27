var http=require('http');
var express=require('express');
var mongoose=require('mongoose');
var app=express();
var socketio=require('socket.io');

var ChatSchema=mongoose.Schema({
    room_number:{type:String, required:true,unique:true},
    sender_id: [{type:String}],
    listener_id:[{type:String}],
    message:[{type:String}],
    date:[{type:Date,"default":Date.now()}]
});
var chat=mongoose.model('chat',ChatSchema);

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
    socket.on('message',function(data){
        if(chat.where({"room_number":data.sender_id+":"+data.listener_id|| data.listener_id+":"+data.sender_id})){
            console.log('hihi');
        };
        io.to(connect[data.sender_id]).emit('message',{name:"나",message:data.message});
        io.to(connect[data.listener_id]).emit('message',{name:data.sender_id, message:data.message});
    });
});
io.sockets.on('disconnection',function(){
    console.log('socket연결이 해제됨.');
});
