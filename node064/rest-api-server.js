const express = require('express');
const app = express();

app.use(express.json());
app.get('/', (req, res)=>{
    console.log("restAPI서버 정상 작동 중");
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
    res.end('restAPI서버 정상 작동 중');
});

app.post('/clan', (req, res)=>{
    console.log(req.body);
    res.json({
        cmd: 200
    });
});

app.listen(3301, ()=>{
    console.log("rest API 서버 시작");
});