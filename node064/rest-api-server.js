const express = require('express');
const app = express();
const cors = require('cors');
const bodyparser = require('body-parser');
const clan = require('./clan');
const moment = require('moment');
const mysql_dbc = require('./mysql_dbc')();

app.use(cors());
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
//app.use(express.json());

app.get('/', (req, res)=>{
    console.log("restAPI서버 정상 작동 중");
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
    res.end('restAPI서버 정상 작동 중');
});


//로그인 
app.post('/login', (req, res)=>{
    console.log(req.body);  //userName

    let pool = mysql_dbc.pool();
    const user_id = clan.getGuid();
    const user_name = req.body.userName;
    const date = moment().format().slice(0, 19).replace('T', ' ');
    const selectClanCode = (con, clan_member_id)=>{
        query = 'select clan_code from clan_members where clan_member_id = ?';
        con.query(query, [clan_member_id], (err, results, fields)=>{

            console.log(results, results.length);

            con.release();

            res.json({
                cmd: 200,
                user_id: user_id,
                clan_code: (results.length > 0) ? results[0].clan_code: null
            });
        });
    };

    mysql_dbc.connectPool(pool, (err, con)=>{
        con.on('error', (err)=>{
            con.release();
            res.json({cmd: 600});
        });
        let query = 'select count(*) as isSignUp, user_id from users where user_name=?';
        con.query(query, [user_name], (err, results, fields)=>{
            console.log("isSignUp:", results[0].isSignUp);
            if( results[0].isSignUp > 0){
                selectClanCode(con, results[0].user_id);

            }else{
                query = 'insert into users(user_id, user_name, date) values(?,?,?)';
                con.query(query, [user_id, user_name, date], (err, results, fields)=>{
                    console.log(results);
                    selectClanCode(con, results[0].user_id);
                });
            }
        });
    });

    console.log(user_id, user_name, date);
});




//클랜 리스트 보기 
app.get('/clan', async (req, res)=>{
    
    let pool = mysql_dbc.pool();
    mysql_dbc.connectPool(pool, (err, con)=>{
        if(err){
            res.json({ cmd: 600 });
        }else{
            let query = 'select * from clans';
            con.query(query, (err, results, fiels)=>{
                if(err){
                    res.json({ cmd: 600 });
                }else{
                    res.json({ cmd: 200, arrClanInfos: results });
                }
            });
        }
    });

});






app.post('/clan/2', (req, res)=>{
    const clanCode = req.body.clan_code;
    console.log(clanCode);
    let pool = mysql_dbc.pool();
    mysql_dbc.connectPool(pool, (err, con)=>{
        if(err){
            con.release();
            res.json({
                cmd: 600
            });
            throw err;
        }else{
            con.on('error', (err)=>{
                console.log(err);
            });

            let query = 'select * from clan_members where clan_code = ?';
            con.query(query, [clanCode], (err, results, fields)=>{
                console.log(results);
                res.json({
                    cmd: 200, 
                    arrClanMemberInfos: results
                });
            });
        }
    });
});

//클랜가입 (맴버)
app.post('/clan/1', (req, res)=>{
    const clan_member_id = req.body.clan_member_id;
    const clan_code = req.body.clan_code;
    const clan_member_name = req.body.clan_member_name;
    const role = 1;
    const date = moment().format().slice(0, 19).replace('T', ' ');

    const pool = mysql_dbc.pool();
    mysql_dbc.connectPool(pool, (err, con)=>{

        con.beginTransaction((err)=>{
            if(err) { 
                con.release();
                throw err; 
            }
            con.on('error', (err)=>{
                con.rollback();
                con.release();
                res.json({cmd: 600});
            });
            let query = 'insert into clan_members (clan_code, clan_member_id, clan_member_name, role, date) values (?,?,?,?,?)';
            con.query(query, [clan_code, clan_member_id, clan_member_name, role, date], (err, results, fields)=>{
                query = 'update clans set clan_member_count = (select count(*) from clan_members) where clan_code=?';
                con.query(query, [clan_code], (err, results, fields)=>{
                    query = 'select * from clans';
                    con.query(query, (err, results, fields)=>{
                        con.commit();
                        con.release();
                        console.log(results);
                        res.json({cmd: 200, arrClanInfos: results });
                    });
                });
            });
        });
    });
});

//클랜 생성 (마스터)
//clan_members
// clan_code
// clan_member_id
// clan_member_name
// role
// date

//clans
// clan_code
// clan_name
// clan_master_id
// clan_desc
// clan_member_count
// clan_member_capacity
// date

/*
set autocommit=0;
start transaction;
insert into clan_members (clan_code, clan_member_id, clan_member_name, role, date) 
values ("kljds", "kjlfjdl", "홍길동", 1, now());
#클랜 추가 
insert into clans(clan_code, clan_name, clan_master_id, clan_desc, clan_member_count, clan_member_capacity, date)
values("kljds", "홍길동 클랜", "kjlfjdl", "홍길동 클랜 입니다.", 1, 15, now());
commit;*/

app.post('/clan', (req, res)=>{
    let clan_member_id = req.body.uid;
    let clan_code = clan.getClanCode(6);
    let clan_name = req.body.clanName;
    let clan_member_name = req.body.userName;
    let clan_desc = req.body.clanDesc;
    let role = 1;
    const date = moment().format().slice(0, 19).replace('T', ' ');
    let pool = mysql_dbc.pool();
    mysql_dbc.connectPool(pool, (err, con)=>{
        if(err) {
            res.json({
                cmd: 600
            });
            con.release();
            throw err;
        }else{
            con.beginTransaction((err)=>{
                if(err) {
                    con.release();
                    res.json({cmd: 600});
                    throw err;
                }

                con.on('error', (err)=>{
                    
                    console.log(err);

                    if(err){
                        con.rollback();
                        con.release();
                        req.json({cmd: 600});
                    }
                });

                let query = 'insert into clan_members (clan_code, clan_member_id, clan_member_name, role, date) values(?,?,?,?,?)';
                con.query(query, [clan_code, clan_member_id, clan_member_name, role, date], (err, results1, fields)=>{
                    
                    if(err){
                        console.log(err);
                        throw err;
                    }
                    console.log('맴버 등록 성공:', results1);

                    query = 'insert into clans(clan_code, clan_name, clan_master_id, clan_desc, clan_member_count, clan_member_capacity, date) values(?,?,?,?,?,?,?)';
                    con.query(query, [clan_code, clan_name, clan_member_id, clan_desc, 1, 15, date], (err, results2, fields)=>{
                        
                        query = 'select * from clans';
                        con.query(query, (err, results3, fields)=>{
                            console.log('클랜 생성 성공:', results3);
                            con.commit();
                            con.release();
                            res.json({
                                cmd: 200,
                                myClanCode: clan_code,
                                arrClanInfos: results3
                            });
                        });
                    });
                });    
            });
        }
    });
});

app.listen(3301, ()=>{
    console.log("rest API 서버 시작");
});