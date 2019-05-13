var express=require("express");
var router=express.Router();
var redisClient=require("../utils/redis");
router.get("/online", (req, res)=>{
    redisClient.LRANGE("online", 0, -1, (err, reply)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:reply});

    })
})

module.exports=router;