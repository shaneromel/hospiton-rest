require("./mongodb").then(db=>{

    const hospitalCollection=db.collection("hospitals");
    const hospitalDoctorCollection=db.collection("hospital_doctors");
    
    module.exports.findNearby=(lat, lng)=>{
        return new Promise((resolve, reject)=>{
            if(lat&&lng){
                let aggregates=[
                    {
                        $geoNear:{
                            sperical:true,
                            distanceField:"dist.calculated",
                            near:{type:"Point", coordinates:[lat, lng]}
                        }
                    },
                    {
                        $match:{is_active:true}
                    }
                ];
    
                hospitalCollection.aggregate(aggregates).toArray((err, results)=>{
                    if(err){
                        reject(err)
                        return;
                    }
    
                    resolve(results);
    
                })
        
            }else{
                reject(new Error("Co-ordinates must be supplied."))
            }
        })
    }

    module.exports.findDoctors=(limit=null, offset=null)=>{
        return new Promise((resolve, reject)=>{

            let boundaries;

            if(limit&&offset){
                boundaries={
                    limit:limit,
                    offset:offset
                };
            }else if(limit&&!offset){
                boundaries={
                    limit:limit
                }
            }else if(!limit&&offset){
                boundaries={
                    offset:offset
                }
            }else{
                boundaries={}
            }

            hospitalDoctorCollection.find({}, boundaries).toArray((err, docs)=>{
                if(err){
                    reject(err);
                    return;
                }

                resolve(docs);

            })
        })
    }

}).catch(err=>{
    console.log(err);
})