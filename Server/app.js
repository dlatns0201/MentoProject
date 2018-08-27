var http=require('http');
var express=require('express');
var mongoose=require('mongoose');
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
var Dburl="mongodb://localhost:27017/local";
mongoose.connect(Dburl);
var database=mongoose.connection();

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
        chat.findOne({"room_number":data.sender_id+":"+data.listener_id || data.listener_id+":"+data.sender_id},function(err,result){
            if(result){
                var sender=result.sender_id;
                sender[sender.length]=data.sender_id;
                var listener=result.listener_id;
                listener[listener.length]=data.listener_id;
                var message=result.message;
                message[message.length]=data.message;
                console.log(result.room_number);
                chat.where({"room_number":result.room_number}).update({"sender_id":sender,"listener_id":listener,"message":message},function(){});
            }else{
                console.log("방이 없음");
            }
        });
        io.to(connect[data.sender_id]).emit('message',{name:"나",message:data.message});
        io.to(connect[data.listener_id]).emit('message',{name:data.sender_id, message:data.message});
    });
});
io.sockets.on('disconnection',function(){
    console.log('socket연결이 해제됨.');
});
