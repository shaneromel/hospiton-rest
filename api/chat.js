var express=require("express");
var router=express.Router();
var redisClient=require("../utils/redis");

router.get("/online", (req, res)=>{
    redisClient.SMEMBERS("online", (err, reply)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:reply});

    })
});

require("../utils/mongodb").then(db=>{
    const chatCollection=db.collection("chats");

    router.get("/history/:user1/:user2", (req, res)=>{
        const {user1}=req.params;
        const {user2}=req.params;

        chatCollection.find({toId:{$in:[user1, user2]}, fromId:{$in:[user1, user2]}}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })

    })

})

module.exports=router;