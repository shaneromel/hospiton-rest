var mysql=require("mysql");
var connection=mysql.createConnection({
    host:process.env.RDS_HOSTNAME,
    user:process.env.RDS_USER,
    password:process.env.RDS_PASSWORD,
    database:process.env.RDS_DATABASE
});

connection.connect(err=>{
    if(err){
        console.log(err);
        return;
    }

    console.log("Connected to rds");

})
module.exports=connection;