var express=require("express");
var router=express.Router();

require("../utils/mongodb").then(db=>{
    router.get("/count/:name", (req, res)=>{
        const collection=req.params.name;
        db.collection(collection).countDocuments().then(count=>{
            res.send({code:"success", count:count});
        }).catch(err=>{
            res.send(err);
        })

    })
})

module.exports=router;