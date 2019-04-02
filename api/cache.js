var express=require("express");
var router=express.Router();
var redis=require("redis");
var redisClient=redis.createClient();
var uniqid=require("uniqid");


router.post("/set", (req, res)=>{
    const hash=uniqid();
    const data=req.body.data;

    console.log(data);

    redisClient.SET(hash, JSON.stringify(data), (err, reply)=>{
        if(err){
            res.send(err);
            return;
        }

        res.send({code:"success", hash:hash});

    })

});

router.get("/get/:hash", (req, res)=>{
    const hash=req.params.hash;

    redisClient.GET(hash, (err, reply)=>{
        if(err){
            res.send(err);
            return;
        }

        res.send({code:"success", data:reply});

    })

})

module.exports=router;