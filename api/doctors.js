var express=require("express");
var router=express.Router();
var rds=require("../utils/rds");

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

                res.send(results);

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

        doctorsCollection.find({$text:{$search:req.query.search}}, {limit:limit, skip:offset}).toArray((err, docs)=>{
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

    })

}).catch(err=>{
    console.log(err);

    router.get("*", (req, res)=>{
        res.send(err);
    })

})

module.exports=router;