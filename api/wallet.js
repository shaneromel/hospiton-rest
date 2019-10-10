var express=require("express");
var router=express.Router();
var walletUtils=require("../utils/wallet");

router.post("/create", (req, res)=>{
    walletUtils.createWallet().then(result=>{
        res.send(result);
    }).catch(err=>{
        res.send({code:"error", message:err.message});
    })
});

router.post("/credit", (req, res)=>{
    const id=req.body.wallet_id;
    const amount=req.body.amount;

    walletUtils.credit(id, amount).then(data=>{
        res.send({code:"success", closing_balance:data.closing_balance});
    }).catch(err=>{
        res.send({code:"error", message:err.message});
    })

});

router.post("/debit", (req, res)=>{
    const id=req.body.wallet_id;
    const amount=req.body.amount;

    walletUtils.debit(id, amount).then(data=>{
        res.send({code:"success", closing_balance:data.closing_balance});
    }).catch(err=>{
        res.send({code:"error", message:err.message});
    })

});

router.get("/trasactions/:uid", (req, res)=>{
    const uid=req.params.uid;

    walletUtils.getTransactionsByUid(uid).then(transactions=>{
        res.send({code:"success", data:
         transactions});
    }).catch(err=>{
        res.send({code:"error", message:err.message});
    })

})

module.exports=router;