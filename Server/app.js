var http = require('http');
var express=require('express');
var mongoose=require('mongoose');
var socketio=require('socket.io');
var app=express();
var ChatSchema = mongoose.Schema({
    room_number: { type: String, required: true, unique: true },
    sender_id: [{ type: String }],
    listener_id: [{ type: String }],
    message: [{ type: String }],
    date: [{ type: Date, "default": Date.now() }]
});
var chat = mongoose.model('chat', ChatSchema);
var Dburl="mongodb://localhost:27017/local";
mongoose.connect(Dburl);
var database=mongoose.connection;

var connect = {};
var server = http.createServer(app).listen(3000, function () {
    console.log("Success Connection: 3000");
});
var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('socket연결됨');

    socket.on('socket_id', function (data) {
        connect[data] = socket.id;
        console.log(socket.id);
    });
    socket.on('loadChat', function (data) {
        chat.find().or([{ "room_number": data.sender_id + ":" + data.listener_id }, { "room_number": data.listener_id + ":" + data.sender_id }], function (err, result) {
            if (result.length > 0) {
                var object;
                for (var i = 0; i < result[0].message.length; i++) {
                    if (connect[result[0].sender_id[i]] == socket.id) {
                        object[i] = {"name":"나","message":result[0].message[i]};
                    }
                    else{
                        object[i]={"name":data.listener_id,"message":result[0].message[i]};
                    }
                }
                socket.emit('loadChat',object);
            }
        });
    });
    socket.on('message', function (data) {
        chat.find().or([{ "room_number": data.sender_id + ":" + data.listener_id }, { "room_number": data.listener_id + ":" + data.sender_id }], function (err, result) {
            if (result.length > 0) {
                var sender = result[0].sender_id;
                sender[sender.length] = data.sender_id;
                var listener = result[0].listener_id;
                listener[listener.length] = data.listener_id;
                var message = result[0].message;
                message[message.length] = data.message;
                console.log(result[0].room_number);
                chat.where({ "room_number": result[0].room_number }).update({ "sender_id": sender, "listener_id": listener, "message": message }, function () { });
            } else {
                console.log("방이 없음");
            }
        });
        io.to(connect[data.sender_id]).emit('message', { name: "나", message: data.message });
        io.to(connect[data.listener_id]).emit('message', { name: data.sender_id, message: data.message });
    });
});
io.sockets.on('disconnection', function () {
    console.log('socket연결이 해제됨.');
});