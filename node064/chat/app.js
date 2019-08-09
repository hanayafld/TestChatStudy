const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');

app.listen(3000);

function handler(req, res){
    fs.readFile(__dirname + "/index.html", (err, data)=>{
        if(err) {
            req.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}

io.on('connection', (socket)=>{
    console.log('connected:', socket.id);

    socket.emit('news', { hello: 'world' });
    socket.on('my other event', (data)=>{
        console.log(data);
    });
});