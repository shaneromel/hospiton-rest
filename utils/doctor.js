require("./mongodb").then(db=>{
    const hospitalDoctorCollection=db.collection("hospital_doctors");

    module.exports.getDoctorsByHospital=(uid)=>{
        return new Promise((resolve, reject)=>{
            hospitalDoctorCollection.find({hospital_uid:uid}).toArray((err, docs)=>{
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