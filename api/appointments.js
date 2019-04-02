var express=require("express");
var router=express.Router();
var mongo = require('mongodb');

require("../utils/mongodb").then(db=>{
    const appointmentCollection=db.collection("appointments");

    router.get("/get/:doctor_id", (req, res)=>{
        const doctorId=req.params.doctor_id;

        // appointmentCollection.find({doctor_id:new mongo.ObjectID(doctorId)}, (err, docs)=>{
        //     if(err){
        //         console.log(err);
        //         return;
        //     }

        //     res.send(docs);

        // })

        appointmentCollection.find({doctor_id:new mongo.ObjectID(doctorId)}).toArray((err, docs)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send(docs);

        })

    });

    router.post("/post", (req, res)=>{
        const appointment=req.body;

        appointmentCollection.insertOne(appointment, (err, result)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send({code:"success"});

        })

    });

}).catch(err=>{
    console.log(err);
})

module.exports=router;