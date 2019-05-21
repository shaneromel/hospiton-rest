var express=require("express");
var router=express.Router();
var redisClient=require("../utils/redis");
var formidable = require('formidable');
var fs=require("fs");
var saveFile=require("save-file");
var path=require("path");
var rds=require("../utils/rds");

router.get("/online", (req, res)=>{
    redisClient.SMEMBERS("online", (err, reply)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:reply});

    })
});

require("../utils/mongodb").then(db=>{
    const chatCollection=db.collection("chats");
    const doctorCollection=db.collection("doctors");
    const userCollection=db.collection("users");

    router.get("/history/:user1/:user2", (req, res)=>{
        const {user1}=req.params;
        const {user2}=req.params;

        chatCollection.find({toId:{$in:[user1, user2]}, fromId:{$in:[user1, user2]}}).toArray((err, results)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success", data:results});

        })

    });

}).catch(err=>{
    console.log(err);
})

router.post("/send-file", (req, res)=>{
    let form = new formidable.IncomingForm();
    let ngChatDestinataryUserId;

    if(!fs.existsSync("./chat_files")){
        fs.mkdirSync("./chat_files");
    }

    form.parse(req).on("field", (name, field)=>{
        if(name==="ng-chat-participant-id"){
            ngChatDestinataryUserId=field;
        }
    }).on("fileBegin", (name, file)=>{
        console.log(file);
    }).on("file", (name, file)=>{
        saveFile(fs.readFileSync(file.path), `./chat_files/${file.name}`).then(()=>{
            console.log("File uploaded");

            const message={
                type: 2,
                toId: ngChatDestinataryUserId,
                message: file.name,
                mimeType: file.type,
                fileSizeInBytes: file.size,
                downloadUrl:  `http://localhost:3000/chat/file/${file.name}`
            }

            res.status(200).json(message);

        }).catch(err=>{
            console.log(err);
        })
        console.log("file uploaded");
    });
});

router.get("/file/:name", (req, res)=>{
    const fileName=req.params.name;
    res.sendFile(path.resolve(__dirname, "..", "chat_files", fileName));
});

module.exports=router;