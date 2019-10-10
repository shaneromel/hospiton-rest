var express=require("express");
var router=express.Router();
var mongo = require('mongodb');

require("../utils/mongodb").then(db=>{

    const feedBackCollection=db.collection("doctor_feedback");

    router.get("/get/:uid", (req, res)=>{

        const uid=req.params.uid;
        const limit=parseInt(req.query.limit);
        const offset=parseInt(req.query.offset);

        let aggregates;

        if(limit&&offset){
            aggregates=[
                {
                    $lookup:{
                        from:"users",
                        localField:"user_uid",
                        foreignField:"uid",
                        as:"user_details"
                    }
                },
                {
                    $match:{
                        user_uid:uid
                    }
                },
                {
                    $limit:limit
                },
                {
                    $skip:offset
                }
            ];
        }else if(limit&&!offset){
            aggregates=[
                {
                    $lookup:{
                        from:"users",
                        localField:"user_uid",
                        foreignField:"uid",
                        as:"user_details"
                    }
                },
                {
                    $match:{
                        user_uid:uid
                    }
                },
                {
                    $limit:limit
                }
            ];
        }else if(!limit&&offset){
            aggregates=[
                {
                    $lookup:{
                        from:"users",
                        localField:"user_uid",
                        foreignField:"uid",
                        as:"user_details"
                    }
                },
                {
                    $match:{
                        user_uid:uid
                    }
                },
                {
                    $skip:offset
                }
            ];
        }else{
            aggregates=[
                {
                    $lookup:{
                        from:"users",
                        localField:"user_uid",
                        foreignField:"uid",
                        as:"user_details"
                    }
                },
                {
                    $match:{
                        user_uid:uid
                    }
                }
            ];
        }

        feedBackCollection.aggregate(aggregates).toArray((err, docs)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            docs=docs.map(a=>{
                if(a.user_details){
                    a.first=a.user_details[0].first;
                    a.last=a.user_details[0].last;
                    a.image=a.user_details[0].image;
                    delete a.user_details;
                };
                return a;
            })

            res.send({code:"success", data:docs});

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