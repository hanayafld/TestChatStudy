const express = require('express');
const cors = require('cors');
const app = express();
const mysql_dbc = require('./mysql_dbc')();

app.use(cors());

app.get('/clan', (req, res)=>{
    const pool = mysql_dbc.pool();
    mysql_dbc.connectPool(pool, (err, con)=>{
        if(err){
            console.error(err);
        }else{
            console.info('connected!');
            let query = "select * from clans";
            con.query(query, (err, results, fields)=>{
                res.json({
                    cmd: 200,
                    clanList: results
                });
            });
        }
    });
});

app.get('/', (req, res)=>{
    res.sendFile(__dirname + "/test.html");
});

app.listen(5050, ()=>{
    console.log('서버 시작: 5050');
});



