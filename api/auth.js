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

            rds.query("INSERT INTO users (uid, type) VALUES (?,?)", [user.uid, "patient"], (err, result, fields)=>{
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

    router.get("/is-new/:uid", (req, res)=>{
        const uid=req.params.uid;
        let promises=[];

        promises.push(new Promise((resolve, reject)=>{
            doctorsCollection.countDocuments({uid:uid}, (err, result)=>{
                if(err){
                    reject(err);
                    return;
                }
    
                resolve(result);
    
            })
        }), new Promise((resolve, reject)=>{
            usersCollection.countDocuments({uid:uid}, (err, result)=>{
                if(err){
                    reject(err);
                    return
                }

                resolve(result)
                
            })
        }));

        Promise.all(promises).then(results=>{
            let users=0;

            results.forEach(a=>{
                users=users+a;
            })

            if(users>0){
                res.send({code:"success", is_new:false});
            }else{
                res.send({code:"success", is_new:true});
            }
        }).catch(err=>{
            res.send({code:"error", message:err.message});
        })

    })

})

module.exports=router;