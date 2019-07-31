const dbconf_local = require('./db_config')().local;
const mysql = require('mysql');

module.exports = function(){
    return {
        init: function (){
            return mysql.createConnection({
                host: dbconf_local.host,
                port: dbconf_local.port,
                user: dbconf_local.user,
                password: dbconf_local.password,
                database: dbconf_local.database
            });
        },
        pool: function(){
            return mysql.createPool(dbconf_local);
        },
        connect: function(con){
            con.connect((err)=>{
                if(err){
                    console.error(err);
                }else{
                    console.info('connected!');
                }
            });
        },
        connectPool: function(pool, callback){
            pool.getConnection(callback);
        }
    };
};