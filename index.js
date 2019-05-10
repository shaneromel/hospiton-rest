require("dotenv").config();
var express=require("express");
var app=express();
var bodyParser = require('body-parser');
var cors=require("cors");


app.get("/", (req, res)=>{
    res.send({status:"OK", description:"Practo REST API"});
});
app.use(cors());
app.use(bodyParser.json());
app.use("/doctors", require("./api/doctors"));
app.use("/appointments", require("./api/appointments"));
app.use("/feedback", require("./api/doctor_feedback"));
app.use("/collections", require("./api/collections"));
app.use("/cache", require("./api/cache"));
app.use("/auth", require("./api/auth"));
app.use("/users", require("./api/users"));

app.listen(3000)