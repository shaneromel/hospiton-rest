var express=require("express");
var router=express.Router();
var mongo = require('mongodb');

require("../utils/mongodb").then(db=>{

    const doctorsCollection=db.collection("doctors");

    router.get("/get", (req, res)=>{

        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);

        doctorsCollection.find({}, {limit:limit, skip:offset}).toArray((err, docs)=>{
            if(err){
                console.log(err);
                res.send(err);
                return;
            }

            res.send(docs);

        })

    });

    router.get("/get/:id", (req, res)=>{
        const id=req.params.id;

        doctorsCollection.findOne({_id:new mongo.ObjectID(id)}, (err, docs)=>{
            if(err){
                console.log(err);
                res.send(err);
                return;
            }

            res.send(docs);

        })
        
    });

    router.get("/search", (req, res)=>{

        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);

        doctorsCollection.find({$text:{$search:req.query.search}}, {limit:limit, skip:offset}).toArray((err, docs)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send(docs);

        })
    });

    router.post("/viewed", (req, res)=>{
        const doctorid=req.body.doctor_id;
        doctorsCollection.updateOne({_id:new mongo.ObjectID(doctorid)}, {$inc:{views:1}}, (err, result)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send({code:"success"});

        })
    })

    router.post("/add", (req, res)=>{
        const doctor=req.body;

        doctorsCollection.insertOne(doctor,(err, result)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send({code:"success"});

        })

    });

}).catch(err=>{
    console.log(err);

    router.get("*", (req, res)=>{
        res.send(err);
    })

})

module.exports=router;