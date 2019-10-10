var admin = require("firebase-admin");

var serviceAccount = require("../config/hospiton-cd061-firebase-adminsdk-e672y-b7a7b31847.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hospiton-cd061.firebaseio.com"
});

module.exports=admin;