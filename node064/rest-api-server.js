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
            throw err;
        }else{
            con.on('error', (err)=>{

            });

            let query = 'select * from clan_members where clan_code = ?';
            con.query(query, (err, results, fields)=>{

            });
        }
    });

    res.json({
        cmd: 200
    });
});


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


app.post('/clan', (req, res)=>{
    //clan_code, clan_name, clan_master_id, clan_desc, DATE 
    const clanCode = clan.getClanCode(6);
    const clanName = req.body.clanName;
    const uid = req.body.uid;
    const userName = req.body.userName;
    const clanDesc = req.body.clanDesc;
    const now = moment().format().slice(0, 19).replace('T', ' ');
    let arrQueryData = [clanCode, clanName, uid, clanDesc, now];
    const pool = mysql_dbc.pool();
    mysql_dbc.connectPool(pool, (err, con)=>{
        if(err){
            console.error(err);
            pool.release();
            res.json({
                cmd: 9988
            });
        }else{
            console.info('connected!');
            //쿼리 실행 
            con.beginTransaction((err)=>{
                if(err) {
                    con.release();
                    throw err;
                }
                let query = 'insert into clan_members(clan_code, clan_member_id, clan_member_name, date) values(?,?,?,?)';
                con.query(query, [clanCode, uid, userName, now], (err, results, fields)=>{
                    if(err) {
                        return con.rollback(()=>{
                            con.release();
                            throw error;       
                        });
                    }
                    query = 'INSERT INTO clans ( clan_code, clan_name, clan_master_id, clan_desc, DATE ) VALUES(?,?,?,?,?)';    
                    con.query(query, arrQueryData, (error, results, fields)=>{
                        if(error){
                            return con.rollback(()=>{
                                con.release();
                                throw error;       
                            });
                        }
                        query = 'select * from clans';    
                        con.query(query, (error, results, fields)=>{
                            if(error){
                                return con.rollback(()=>{
                                    con.release();
                                    throw error;
                                });
                            }
                            con.commit((err)=>{
                                if(err){
                                    return con.rollback(()=>{
                                        con.release();
                                        throw err;
                                    });
                                }
                                console.log('success');
                                con.release();
    
                                res.json({
                                    cmd: 200,
                                    clanList: results
                                });
    
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