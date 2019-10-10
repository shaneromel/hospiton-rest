require("./mongodb").then(db=>{

    const hospitalCollection=db.collection("hospitals");
    
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

}).catch(err=>{
    console.log(err);
})