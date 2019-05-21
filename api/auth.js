var express=require("express");
var router=express.Router();
var rds=require("../utils/rds");

require("../utils/mongodb").then(db=>{
    const usersCollection=db.collection("users");
    const doctorsCollection=db.collection("doctors");

    router.post("/user", (req, res)=>{
        const user=req.body;

        usersCollection.insertOne(user, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            rds.query("INSERT INTO users (uid, type) VALUES (?,?)", [doctor.uid, "patient"], (err, result, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }

                res.send({code:"success"});

            })

        })
    });

    router.post("/doctor", (req, res)=>{
        const doctor=req.body;

        doctorsCollection.insertOne(doctor,(err, result)=>{
            if(err){
                res.send(err);
                return;
            }

            rds.query("INSERT INTO users (uid, type) VALUES (?,?)", [doctor.uid, "doctor"], (err, result, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }

                res.send({code:"success"});

            })

        })

    })

})

module.exports=router;