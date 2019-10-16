var express=require("express");
var router=express.Router();
var rds=require("../utils/rds");
var walletUtils=require("../utils/wallet");

require("../utils/mongodb").then(db=>{
    const usersCollection=db.collection("users");
    const doctorsCollection=db.collection("doctors");
    const hospitalCollection=db.collection("hospital");

    router.post("/user", (req, res)=>{
        let user=req.body;

        walletUtils.createWallet().then(data=>{
            user.wallet_id=data._id;

            usersCollection.insertOne(user, (err, result)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                };
    
                rds.query("INSERT INTO users (uid, type) VALUES (?,?)", [user.uid, "patient"], (err, result, fields)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }
    
                    res.send({code:"success"});
    
                })
    
            })

        }).catch(err=>{
            res.send({code:"error", message:err.message});
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

    });
    
    router.post("/hospital", (req, res)=>{
        const hostpital=req.body;

        hospitalCollection.insertOne(hostpital, (err, result)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            rds.query("INSERT INTO users (uid, type) VALUES (?,?)", [doctor.uid, "hospital"], (err, result, fields)=>{
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
                res.send({code:"success", data:{is_new:false}});
            }else{
                res.send({code:"success", data:{is_new:false}});
            }
        }).catch(err=>{
            res.send({code:"error", message:err.message});
        })

    });

}).catch(err=>{
    console.log(err);
})

module.exports=router;