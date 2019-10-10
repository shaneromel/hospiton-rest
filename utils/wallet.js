var mongo = require('mongodb');
var uniqid=require("uniqid");

require("./mongodb").then(db=>{
    const walletCollection=db.collection("wallets");
    const walletTransactionCollection=db.collection("wallet_transactions");
    const userCollection=db.collection("users");

    module.exports.createWallet=()=>{
        return new Promise((resolve, reject)=>{
            const data={
                _id:uniqid("WALLET-"),
                balance:0
            };
            walletCollection.insertOne(data, (err, result)=>{
                if(err){
                    reject(err);
                    return;
                }

                resolve({_id:data._id});

            })
        })
    }

    module.exports.credit=(walletId, amount)=>{
        return new Promise((resolve, reject)=>{
            let data={
                wallet_id:walletId,
                amount:amount,
                type:"credit",
                timestamp:Date.now()
            }
    
            walletCollection.updateOne({_id:walletId}, {$inc:{balance:amount}}, (err, result)=>{
                if(err){
                    reject(err);
                    return;
                }

                walletCollection.findOne({_id:walletId}, (err, doc)=>{
                    if(err){
                        reject(err);
                        return;
                    }

                    if(doc){
                        data.closing_balance=doc.balance;

                        walletTransactionCollection.insertOne(data, (err, result)=>{
                            if(err){
                                reject(err);
                                return;
                            }

                            resolve({closing_balance:doc.balance})

                        })
                    }else{
                        reject(new Error("No such wallet exists"));
                    }

                })

            })
        })
    }

    module.exports.debit=(walletId, amount)=>{
        return new Promise((resolve, reject)=>{
            let data={
                wallet_id:walletId,
                amount:amount,
                type:"debit",
                timestamp:Date.now()
            }
    
            walletCollection.updateOne({_id:walletId}, {$inc:{balance:-amount}}, (err, result)=>{
                if(err){
                    reject(err);
                    return;
                }

                walletCollection.findOne({_id:walletId}, (err, doc)=>{
                    if(err){
                        reject(err);
                        return;
                    }

                    if(doc){
                        data.closing_balance=doc.balance;

                        walletTransactionCollection.insertOne(data, (err, result)=>{
                            if(err){
                                reject(err);
                                return;
                            }

                            resolve({closing_balance:doc.balance})

                        })
                    }else{
                        reject(new Error("No such wallet exists"));
                    }

                })

            })
        })
    }

    module.exports.getTransactionsByUid=(uid)=>{
        return new Promise((resolve, reject)=>{
            userCollection.findOne({uid:uid}, (err, doc)=>{
                if(err){
                    reject(err);
                    return;
                }

                if(doc){
                    const walletId=doc.wallet_id;

                    walletTransactionCollection.find({wallet_id:walletId}).toArray((err, docs)=>{
                        if(err){
                            reject(err);
                            return;
                        }

                        resolve(docs);

                    })

                }else{
                    reject(new Error("No such user exists"));
                }

            })
        })
    }

});