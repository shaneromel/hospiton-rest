require("dotenv").config();
var express=require("express");
var app=express();
var bodyParser = require('body-parser');
var cors=require("cors");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", (req, res)=>{
    res.send({status:"OK", description:"Practo REST API"});
});
app.use("/doctors", require("./api/doctors"));
app.use("/appointments", require("./api/appointments"));
app.use("/feedback", require("./api/doctor_feedback"));
app.use("/collections", require("./api/collections"));
app.use("/cache", require("./api/cache"));
app.use("/auth", require("./api/auth"));
app.use("/users", require("./api/users"));
app.use("/chat", require("./api/chat"));
app.use("/common", require("./api/common"));
app.use("/orders", require("./api/orders"));
app.use("/patients", require("./api/patients"));

app.listen(3000)