var express=require("express");
var router=express.Router();

require("../utils/mongodb").then(db=>{
    const orderCollection=db.collection("orders");
    
    router.post("/", (req, res)=>{
        const order=req.body;

        orderCollection.insertOne(order, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"})

        })

    })
}).catch(err=>{
    console.log(err)
})

module.exports=router;