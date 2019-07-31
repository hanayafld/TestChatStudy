const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket)=>{
    console.log(`soket.id : ${socket.id}`);
});

app.get('/', (req, res)=>{
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
    res.end('<h1>socket 서버 정상 작동 중</h1>');
});

app.get('/chat', (req, res)=>{
    res.sendFile(__dirname + '/chat.html');
});

http.listen(3300, ()=>{
    console.log('socket 서버가 시작되었습니다.');
});