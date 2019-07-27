var express=require("express");
var router=express.Router();

require("../utils/mongodb").then(db=>{
    router.get("/count/:name", (req, res)=>{
        const collection=req.params.name;
        db.collection(collection).countDocuments().then(count=>{
            res.send({code:"success", count:count});
        }).catch(err=>{
            res.send(err);
        })

    })

    router.get("/doctor-search-count/:search", (req, res)=>{
        const search=req.params.search;

        db.collection("doctors").countDocuments({$text:{$search:search}}).then(count=>{
            res.send({code:"success", count:count});
        }).catch(err=>{
            res.send({code:"error", message:err});
        })

    })

}).catch(err=>{
    console.log(err);
})

module.exports=router;