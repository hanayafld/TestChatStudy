const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3030);

app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', (socket)=>{
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', (data)=>{
        console.log(data);
    });
});