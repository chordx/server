 var mysql=require('mysql');
var connection=mysql.createPool({
 host:'chordxinstance.c2a7nxidsl3c.us-east-1.rds.amazonaws.com',
  user:'chordx_tech',
  password:'f8rTgCDAMOM2',
  database:'chordx_db',
  multipleStatements: true  
});
 module.exports=connection;