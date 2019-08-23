var express=require("express");
var router=express.Router();
var mongo = require('mongodb');
var request=require("request");

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
        const timestamp=req.body.timestamp;

        appointmentCollection.updateOne({_id:mongo.ObjectId(id)}, {$set:{is_confirmed:true, timestamp:timestamp}}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
        
    });

    router.get("/pending/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({is_confirmed:false, doctor_uid:uid}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })
    });

    router.get("/user-pending/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({is_confirmed:false, user_uid:uid}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })
    });

    router.get("/confirmed/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({is_confirmed:true, is_complete:false, doctor_uid:uid}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })
    });

    router.get("/user-confirmed/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({is_confirmed:true, is_complete:false, user_uid:uid}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })
    })

    router.get("/completed/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({is_complete:true, doctor_uid:uid}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })

    });

    router.get("/user-completed/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({is_complete:true, user_uid:uid}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })
    })

    router.get("/search-user/:search/:doctor_uid", (req, res)=>{
        const userCollection=db.collection("users");
        const search=req.params.search;
        const doctorUid=req.params.doctor_uid;

        userCollection.find({$text:{$search:search}}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            if(results){
                const userUids=results.map(a=>a.uid);

                appointmentCollection.find({doctor_uid:doctorUid, user_uid:{$in:userUids}}).toArray((err, results)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    res.send({code:"success", data:results});
                    
                })
            }else{
                res.send({code:"success", data:[]});
            }

        })

    });

    router.get("/search-doctor/:search/:user_uid", (req, res)=>{
        const doctorCollection=db.collection("doctors");
        const search=req.params.search;
        const userUid=req.params.user_uid;

        doctorCollection.find({$text:{$search:search}}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            if(results){
                const doctorUids=results.map(a=>a.uid);

                appointmentCollection.find({user_uid:userUid, doctor_uid:{$in:doctorUids}}).toArray((err, results)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    res.send({code:"success", data:results});
                    
                })
            }else{
                res.send({code:"success", data:[]});
            }

        })
    })

    router.post("/complete", (req, res)=>{
        const id=req.body.id;
        const completeTimestamp=Date.now();

        appointmentCollection.updateOne({_id:mongo.ObjectId(id)},{$set:{is_complete:true, complete_timestamp:completeTimestamp}}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    });

    router.post("/update/:id", (req, res)=>{
        const data=req.body;
        const id=req.params.id;

        appointmentCollection.updateOne({_id:mongo.ObjectId(id)}, {$set:data}, (err, result)=>{
            if(err){
                res.send({code:"success", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    });

    router.get("/calendar/:uid", (req, res)=>{
        const uid=req.params.uid;

        appointmentCollection.find({doctor_uid:uid}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            if(results){
                let promises=[];
                results.forEach(a=>{
                    promises.push(new Promise((resolve, reject)=>{
                        request.get(`http://localhost:3000/users/${a.user_uid}`, {json:true},(err, response, body)=>{
                            if(err){
                                reject(err);
                                return;
                            }

                            if(response.body.code==="success"){
                                a.user=response.body.data;
                                resolve(a);
                            }else{
                                reject(new Error(response.body.message))
                            }

                        })
                    }));
                });

                Promise.all(promises).then(data=>{
                    res.send({code:"success", data:data})
                }).catch(err=>{
                    res.send({code:"error", message:err.message});
                })

            }else{
                res.send({code:"success", data:[]})
            }

        })

    });

    

}).catch(err=>{
    console.log(err);
})

module.exports=router;