var express=require("express");
var router=express.Router();
var mongo=require("mongodb");

require("../utils/mongodb").then(db=>{

    const hospitalCollection=db.collection("hospitals");
    const hospitalDoctorCollection=db.collection("hospital_doctors");
    const hospitalAppointmentCollection=db.collection("hospital_appointments");

    router.get("/", (req, res)=>{
        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);
        const lat=parseFloat(req.query.lat);
        const lng=parseFloat(req.query.lng);
    
        if(lat&&lng){
            let aggregates=[
                {
                    $geoNear:{
                        sperical:true,
                        distanceField:"dist.calculated",
                        near:{type:"Point", coordinates:[lat, lng]}
                    }
                },
                {
                    $match:{is_active:true}
                }
            ];
    
            if(limit&&offset){
                aggregates.push({
                    $limit:limit
                },
                {
                    $skip:offset
                })
            }else if(limit && !offset){
                aggregates.push({
                    $limit:limit
                });
            }else if(offset && !limit){
                aggregates.push({
                    $skip:offset
                });
            }

            hospitalCollection.aggregate(aggregates).toArray((err, results)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }

                res.send(results);

            })
    
        }else{
            hospitalCollection.find({is_active:true}, {limit:limit, skip:offset}).toArray((err, docs)=>{
                if(err){
                    res.send(err);
                    return;
                }
    
                res.send(docs);
    
            })
        }
    
    });

    router.post("/doctor", (req, res)=>{
        const doctor=req.body;

        hospitalDoctorCollection.insertOne(doctor, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    });

    router.get("/search-doctors/:uid", (req, res)=>{

        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);
        const uid=req.params.uid;

        hospitalDoctorCollection.find({$text:{$search:req.query.search}, hospital_uid:uid}, {limit:limit, skip:offset}).toArray((err, docs)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send(docs);

        })
    });

    router.post("/update-doctor/:id", (req, res)=>{
        const doctor=req.body;
        console.log(doctor);
        hospitalDoctorCollection.updateOne({_id:mongo.ObjectId(req.params.id)}, {$set:doctor}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    })

    router.get("/doctors/:uid", (req, res)=>{
        const uid=req.params.uid;

        hospitalDoctorCollection.find({hospital_uid:uid}).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send(docs);
        })

    });

    router.get("/:uid", (req, res)=>{
        const uid=req.params.uid;
        console.log(uid)
        hospitalCollection.findOne({uid:uid}, (err, doc)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send(doc);

        })

    })

    router.delete("/doctor/:id", (req, res)=>{
        const id=mongo.ObjectID(req.params.id);
        
        hospitalDoctorCollection.deleteOne({_id:id}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
    })

    router.get("/appointments/:uid", (req, res)=>{
        const uid=req.params.uid;

        // hospitalAppointmentCollection.find({hospital_uid:uid}).toArray((err, docs)=>{
        //     if(err){
        //         res.send({code:"error", message:err.message});
        //         return;
        //     }
        //     res.send(docs);

        // });

        hospitalAppointmentCollection.aggregate([
            {
                $lookup:{
                    from:"users",
                    localField:"user_uid",
                    foreignField:"uid",
                    as:"user_details"
                }
            },
            {
                $lookup:{
                    from:"hospital_doctors",
                    localField:"doctor_id",
                    foreignField:"_id",
                    as:"doctor_details"
                }
            },
            {
                $match:{hospital_uid:uid}
            },
            {
                $project:{
                    "user_details.first":1,
                    "user_details.last":1,
                    "user_uid":1,
                    hospital_uid:1,
                    message:1,
                    is_confirmed:1,
                    is_complete:1,
                    "user_details.image":1,
                    preferred_timestamp:1,
                    timestamp:1,
                    type:1,
                    "doctor_details.first":1,
                    "doctor_details.last":1,
                    "doctor_details.photo":1,
                    doctor_id:1,
                    is_paid:1,
                    is_cancelled:1
                }
            }
        ]).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            docs=docs.map(a=>{
                a.user_details=a.user_details[0];
                a.doctor_details=a.doctor_details[0];
                a.doctor_details.image=a.doctor_details.photo;
                delete a.doctor_details.photo;
                return a;
            })

            res.send(docs);

        })

    });

    router.post("/appointment", (req, res)=>{
        const data=req.body;
        data.timestamp=Date.now();
        data.doctor_id=mongo.ObjectID(data.doctor_id);
        data.is_cancelled=false;

        hospitalAppointmentCollection.insertOne(data, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    })

    router.post("/complete-appointment/:id", (req, res)=>{
        const id=mongo.ObjectID(req.params.id);

        hospitalAppointmentCollection.updateOne({_id:id}, {$set:{is_complete:true}}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    })

    router.post("/confirm-appointment/:id", (req, res)=>{
        const id=req.params.id;
        const data=req.body;
        delete data._id;

        hospitalAppointmentCollection.updateOne({_id:mongo.ObjectID(id)}, {$set:data}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    })

    router.post("/cancel-appointment/:id", (req, res)=>{
        const id=req.params.id;

        hospitalAppointmentCollection.updateOne({_id:mongo.ObjectID(id)}, {$set:{is_cancelled:true}}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
    })

    router.get("/appointments-by-user/:uid", (req, res)=>{
        const uid=req.params.uid;

        hospitalAppointmentCollection.find({user_uid:uid}).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send(docs);

        })

    })

})

module.exports=router;