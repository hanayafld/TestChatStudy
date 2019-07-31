// const moment = require('moment');
// const clan = require('./clan');
// const clanCode = clan.getClanCode(6);
// const uid = clan.getGuid();
// console.log(clanCode);
// console.log(uid);
// const now = moment().format().slice(0, 19).replace('T', ' ');
// console.log(now);
const mysql_dbc = require('./mysql_dbc')();
// const connection = mysql_dbc.init();
// mysql_dbc.connect(connection);

const pool = mysql_dbc.pool();
mysql_dbc.connectPool(pool, (err, con)=>{
    if(err){
        console.error(err);
    }else{
        console.info('connected!');
        //쿼리 실행 
        
    }
});