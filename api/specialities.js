var express=require("express");
var router=express.Router();
var rdsClient=require("../utils/rds");

router.get("/", (req, res)=>{
    rdsClient.query("SELECT * FROM specialities", [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
});

router.post("/", (req, res)=>{
    rdsClient.query("INSERT INTO specialities (title) VALUES (?)", [req.body.title], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })
});

module.exports=router;