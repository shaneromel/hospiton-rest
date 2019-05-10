var express=require("express");
var router=express.Router();

require("../utils/mongodb").then(db=>{
    const userCollection=db.collection("users");

    router.get("/:uid", (req, res)=>{
        const uid=req.params.uid;

        userCollection.findOne({uid:uid}, (err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })

    })

});

module.exports=router;