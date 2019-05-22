var express=require("express");
var router=express.Router();
var mongo = require('mongodb');

require("../utils/mongodb").then(db=>{
    const appointmentCollection=db.collection("appointments");

    router.get("/by-doctor/:doctor_uid", (req, res)=>{
        const uid=req.params.doctor_uid;

        // appointmentCollection.find({doctor_id:new mongo.ObjectID(doctorId)}, (err, docs)=>{
        //     if(err){
        //         console.log(err);
        //         return;
        //     }

        //     res.send(docs);

        // })

        appointmentCollection.find({doctor_uid:uid}).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:docs});

        })

    });

    router.get("/by-user/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({user_uid:uid}).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:docs});

        })

    })

    router.post("/book", (req, res)=>{
        const appointment=req.body;

        appointmentCollection.insertOne(appointment, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    });

    router.delete("/cancel/:id", (req, res)=>{
        const id=req.params.id;

        appointmentCollection.deleteOne({_id:new mongo.ObjectID(id)}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return
            }

            res.send({code:"success"});

        })

    });

    router.post("/confirm", (req, res)=>{
        const id=req.body.id;

        appointmentCollection.updateOne({_id:mongo.ObjectId(id)}, {$set:{is_confirmed:true}}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
        
    })

}).catch(err=>{
    console.log(err);
})

module.exports=router;