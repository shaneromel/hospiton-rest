var express=require("express");
var router=express.Router();
var mongo = require('mongodb');

require("../utils/mongodb").then(db=>{

    const feedBackCollection=db.collection("doctor_feedback");

    router.get("/get/:uid", (req, res)=>{

        const uid=req.params.uid;
        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);

        feedBackCollection.find({doctor_uid:uid}, {limit:limit, skip:offset}).toArray((err, docs)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send(docs);

        })

    });

    router.get("/hospital-doctor/:id", (req, res)=>{
        const id=req.params.id;
        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);

        feedBackCollection.find({doctor_id:mongo.ObjectID(id)}, {limit:limit, skip:offset}, (err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send(docs);

        })

    });

}).catch(err=>{
    console.log(err);
});

module.exports=router;