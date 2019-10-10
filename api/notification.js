var express=require("express");
var router=express.Router();
var notficationUtils=require("../utils/notification");

router.post("/:uid", (req, res)=>{
    const uid=req.params.uid;
    const payload=req.body;
    notficationUtils.sendNotificationByUid(uid, payload).then(()=>{
        res.send({code:"success"})
    }).catch(err=>{
        res.send({code:"error", message:err.message});
    })
})

module.exports=router;