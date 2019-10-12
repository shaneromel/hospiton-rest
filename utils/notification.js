var admin=require("./firebase");
var rds=require("./rds");

module.exports.sendNotificationByUid=(uid, payload)=>{
    return new Promise((resolve, reject)=>{
        rds.query("SELECT fcm_key FROM users WHERE uid = ?", [uid], (err, result, fields)=>{
            if(err){
                reject(err);
                return;
            }

            if(result.length>0){
                const token=result[0].fcm_key;
                const message={
                    data:payload,
                    token:token
                };

                admin.messaging().send(message).then(()=>{
                    resolve();
                }).catch(err=>{
                    reject(err);
                })

            }else{
                reject(new Error("No such user exists"));
            }

        })
    })
}