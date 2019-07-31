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

app.post('/clan', (req, res)=>{
    //clan_code, clan_name, clan_master_id, clan_desc, DATE 
    const clanCode = clan.getClanCode(6);
    const clanName = req.body.clanName;
    const uid = req.body.uid;
    const clanDesc = req.body.clanDesc;
    const now = moment().format().slice(0, 19).replace('T', ' ');
    let arrQueryData = [clanCode, clanName, uid, clanDesc, now];
    const pool = mysql_dbc.pool();
    mysql_dbc.connectPool(pool, (err, con)=>{
        if(err){
            console.error(err);
            pool.releaseConnection();
            res.json({
                cmd: 9988
            });
        }else{
            console.info('connected!');
            //쿼리 실행 
            con.beginTransaction((err)=>{
                if(err) throw err;
                let query = 'INSERT INTO clans ( clan_code, clan_name, clan_master_id, clan_desc, DATE ) VALUES(?,?,?,?,?)';    
                con.query(query, arrQueryData, (error, results, fields)=>{
                    if(error){
                        return con.rollback(()=>{
                            con.releaseConnection();
                            throw error;       
                        });
                    }
                    query = 'select * from clans';    
                    con.query(query, (error, results, fields)=>{
                        if(error){
                            return con.rollback(()=>{
                                con.releaseConnection();
                                throw error;
                            });
                        }
                        con.commit((err)=>{
                            if(err){
                                return con.rollback(()=>{
                                    con.releaseConnection();
                                    throw err;
                                });
                            }
                            console.log('success');
                            con.releaseConnection();

                            res.json({
                                cmd: 200,
                                clanList: results
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