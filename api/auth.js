var express=require("express");
var router=express.Router();

require("../utils/mongodb").then(db=>{
    const usersCollection=db.collection("users");
    router.post("/user", (req, res)=>{
        const user=req.body;

        usersCollection.insertOne(user, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
    })
})

module.exports=router;