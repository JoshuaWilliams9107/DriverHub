let username;
let password;
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "database-2.crbonmxqlhis.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "wZ!2o4PKj",
  database: "sys"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const express = require('express')
const app = express()
const port = 3000

app.use(express.urlencoded({
  extended: true
}))

app.post('/submit-form', (req, res) => {
  username = req.body.username;
  password = req.body.password;

  let sql = "SELECT * FROM Drivers WHERE Username= \"" + username + "\"";

  con.query(sql, function (err, result) {
   if (err) throw err;
   if(result.length != 0){
    res.send("I did find that in the database");
  }else{
    res.send('I did not find that in the database');
  }
  });
  //if(result[0].username == user){
  //  console.log(username);
  //  console.log(password);
  //}
})

//app.get('/', (req, res) => {
//  res.send('Hello World!')
//}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
