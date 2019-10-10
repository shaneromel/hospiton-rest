var express=require("express");
var router=express.Router();
var mongo = require('mongodb');
var moment=require("moment");

require("../utils/mongodb").then(db=>{

    const offlineAppointmentCollection=db.collection("offline_appointments");

    router.get("/:uid", (req, res)=>{
        const {uid}=req.params;
        const start=moment().startOf("day").toDate();
        const end=moment().endOf("day").toDate();
        
        offlineAppointmentCollection.find({hospital_uid:uid, timestamp:{$gte:start.getTime(), $lte:end.getTime()}}).sort({timestamp:1}).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }
            res.send({code:"success", data:docs});

        })
    
    });

    router.post("/complete", (req,res)=>{
        const id=mongo.ObjectID(req.body._id);
        console.log(req.body)
        offlineAppointmentCollection.updateOne({_id:id}, {$set:{is_complete:true}}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});
        })
    });

    router.post("/", (req, res)=>{
        let data=req.body;
        data.is_complete=false;
        data.timestamp=Date.now();

        offlineAppointmentCollection.insertOne(data, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    });

    router.get("/postion/:uid/:hospital_uid", (req, res)=>{
        const uid=req.params.uid;
        const hospitalUid=req.params.hospital_uid;
        const start=moment().startOf("day").toDate();
        const end=moment().endOf("day").toDate();

        offlineAppointmentCollection.find({is_complete:true, hospital_uid:hospitalUid, timestamp:{$gte:start.getTime(), $lte:end.getTime()}}).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            if(docs.length>0){
                let pos;

                docs.forEach((a, i)=>{
                    if(uid===a.user_uid){
                        pos=i;
                    }
                });

                if(pos){
                    res.send({code:"success", position:pos});
                }else{
                    res.send({code:"error", message:"No such appointment found for today."})
                }
            }else{
                res.send({code:"error", message:"No appointments found for today"})
            }

        })

    })

}).catch(err=>{
    console.log(err);
})

module.exports=router;