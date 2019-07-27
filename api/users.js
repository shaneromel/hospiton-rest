var express=require("express");
var router=express.Router();

require("../utils/mongodb").then(db=>{
    const userCollection=db.collection("users");

    router.get("/:uid", (req, res)=>{
        const uid=req.params.uid;

        userCollection.findOne({uid:uid}, (err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })

    })

    router.post("/toggle-favorite", (req, res)=>{
        const data=req.body;
        const userUid=data.user_uid;
        const doctorUid=data.doctor_uid;

        userCollection.findOne({uid:userUid, favorite_doctors:doctorUid}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            if(result){
                userCollection.updateOne({uid:userUid}, {$pull:{favorite_doctors:{$in:[doctorUid]}}}, (err, result)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    res.send({code:"success"});

                })
            }else{
                userCollection.updateOne({uid:userUid}, {$push:{favorite_doctors:doctorUid}}, (err, result)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    res.send({code:"success"});

                })
            }

        })

    });

    router.post("/update/:uid", (req, res)=>{
        const uid=req.params.uid;

        userCollection.updateOne({uid:uid}, {$set:req.body}, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
    })

}).catch(err=>{
    console.log(err);
});

module.exports=router;