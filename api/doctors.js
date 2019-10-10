var express=require("express");
var router=express.Router();
var rds=require("../utils/rds");
var hospitalUtils=require("../utils/hospital");
var doctorUtils=require("../utils/doctor");

require("../utils/mongodb").then(db=>{

    const doctorsCollection=db.collection("doctors");

    router.get("/get", (req, res)=>{

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

            doctorsCollection.aggregate(aggregates).toArray((err, results)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }

                hospitalUtils.findNearby(lat, lng).then(docs=>{
                    let promises=[];
                    
                    promises=docs.map(a=>{
                        return doctorUtils.getDoctorsByHospital(a.uid);
                    })
    
                    Promise.all(promises).then(doctors=>{
                        doctors.forEach(d=>{
                            results.push(...d);
                        })

                        res.send(results);

                    }).catch(err=>{
                        console.log(err);
                    })
    
                }).catch(err=>{
                    console.log(err);
                })

            })
        }else{
            doctorsCollection.find({is_active:true}, {limit:limit, skip:offset}).toArray((err, docs)=>{
                if(err){
                    console.log(err);
                    res.send(err);
                    return;
                }
    
                res.send(docs);
    
            })
        }

    });

    router.get("/get/:uid", (req, res)=>{
        const uid=req.params.uid;

        doctorsCollection.findOne({uid:uid}, (err, docs)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send(docs);

        })
        
    });

    router.get("/search", (req, res)=>{

        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);
        const search=req.query.search;

        let query={$text:{$search:search}};

        doctorsCollection.find(query, {limit:limit, skip:offset}).toArray((err, docs)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send(docs);

        })

    });

    router.post("/viewed", (req, res)=>{
        const doctorUid=req.body.doctor_id;
        doctorsCollection.updateOne({uid:doctorUid}, {$inc:{views:1}}, (err, result)=>{
            if(err){
                res.send(err);
                return;
            }

            res.send({code:"success"});

        })
    });

    router.post("/update/:uid", (req, res)=>{
        const uid=req.params.uid;
        const data=req.body;

        doctorsCollection.updateOne({uid:uid}, {$set:data}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"})

        })

    });

    router.get("/by-speciality/:speciality", (req, res)=>{
        const speciality=req.params.speciality;

        doctorsCollection.find({speciality:speciality}).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:docs});

        })

    })

}).catch(err=>{
    console.log(err);

    router.get("*", (req, res)=>{
        res.send(err);
    })

})

module.exports=router;