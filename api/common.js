var express=require("express");
var router=express.Router();
var rds=require("../utils/rds");

require("../utils/mongodb").then(db=>{

    const userCollection=db.collection("users"), doctorCollection=db.collection("doctors");

    router.get("/:uid", (req, res)=>{
        const uid=req.params.uid;
    
        rds.query("SELECT type FROM users WHERE uid = ?", [uid], (err, result, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }
    
            if(result.length>0){
                const type=result[0].type;
    
                switch(type){
                    case "doctor":
    
                    doctorCollection.findOne({uid:uid}, (err, result)=>{
                        if(err){
                            res.send({code:"error", message:err.message});
                            return;
                        }

                        res.send({code:"success", data:result});

                    });
                    break;
                    case "patient":

                    userCollection.findOne({uid:uid}, (err, result)=>{
                        if(err){
                            res.send({code:'error', message:err.message});
                            return;
                        }

                        res.send({code:"success", data:result});

                    })

                    break;
                    default:
                    res.send({code:"error", message:"Invalid type"})
                }
    
            }else{
                res.send({code:"error", message:"No such user exists"})
            }
    
        })
        
    });
}).catch(err=>{
    console.log(err);
})

router.get("/type/:uid", (req, res)=>{
    const uid=req.params.uid;

    rds.query("SELECT type FROM users WHERE uid = ?", [uid], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(result.length>0){
            res.send({code:"success", type:result[0].type});
        }else{
            res.send({code:"error", message:"No such user exists"});
        }

    })

})

module.exports=router;