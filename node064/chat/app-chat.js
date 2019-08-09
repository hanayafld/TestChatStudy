const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3030);

app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/chat.html");
});

io.on('connection', (socket)=>{
    
    console.log("클라이언트 접속:" + socket.id);

    //소켓 접속종료 
    socket.on('disconnect', ()=>{
        console.log('클라이언트 접속 종료: ' + socket.id);
    });

    //클라에서 받는 부분 
    socket.on('join', (data)=>{
        console.log(data);
        socket.emit('welcome', { name: data.name });
        socket.broadcast.emit('welcome', { name: data.name });
        //io.sockets.emit("welcome", { name: data.name });
    });

    socket.on('sendMessage', (data)=>{
        console.log(data.name, data.roomName, data.message);
        io.to(data.roomName).emit('sendMessage', { name: data.name, message: data.message }); 
    });

    socket.on('createRoom', (data)=>{
        console.log(data.roomName, data.name);
        socket.join(data.roomName, ()=>{
            io.to(data.roomName).emit('createRoom', { roomName: data.roomName}); 
        });
        
    });

    socket.on('joinRoom', (data)=>{
        console.log(data.roomName, data.name);
        socket.join(data.roomName, () => {
            io.to(data.roomName).emit('joinRoom', { name: data.name }); 
        });
    });

    //클라로 보내는 부분 
    // socket.emit('join', {});
    // socket.emit('news', { hello: 'world' });
    // socket.on('my other event', (data)=>{
    //     console.log(data);
    // });
});