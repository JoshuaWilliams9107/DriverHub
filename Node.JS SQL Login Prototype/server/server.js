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
var session = require("express-session");
app.use(session({resave: true, saveUninitialized:true, secret: "shhhhhhhhh"}));
app.use(express.urlencoded({
  extended: true
}))

app.post('/submit-form', (req, res) => {
  if(!req.session.submitNumber){
    req.session.submitNumber = 0;
  }
  req.session.submitNumber +=1;
  if(req.session.submitNumber < 5){
  let username = req.body.username;
  let password = req.body.password;

  let sql = "SELECT * FROM User WHERE Username= \"" + username + "\"";

  con.query(sql, function (err, result) {
   if (err) throw err;
   if(result.length != 0){
    res.write('<h1>I did find that in the database<h1>');
    if(result[0].User_Type == "Driver"){
        res.write('you are a driver');
    }
    else if(result[0].User_Type == "Admin"){
	res.write('you are an admin');
    }
    else if(result[0].User_Type == "Sponsor"){
	res.write('you are a driver');
    }
    res.end();
  }else{
    res.send('I did not find that in the database also this worked!');
  }
  });
  }else{
    res.send("Too many attempts to log in have been made, please try again later");
  }

  //if(result[0].username == user){
  //  console.log(username);
  //  console.log(password);
  //}
})
/*
function getInfo(data, callback){
  let sql2 = `SELECT * FROM User where Username= "${req.body.create_username}"`;
  con.query(sql2, function (err, result) {
   let returnTag = false;
   if (err){
    throw err;
    }else{
        if(result.length > 0){
          console.log("This is not unique");
          con.returnTag = true;
        }else{
          console.log("This is unique");
        }
    }
    return callback(returnTag);
  });
}
*/
app.post('/submit-form-signup', (req, res) => {
  let sql = `INSERT INTO User (Email,First_Name,Last_Name,Username,Password,User_Type) VALUES (
  \"${req.body.email}\",\"${req.body.first_name}\",\"${req.body.last_name}\",
  \"${req.body.create_username.toLowerCase()}\",\"${req.body.create_password}\",\"Driver\")`;

  con.query(sql, function (err, result) {
   if (err){
    throw err;
   }else{
   	res.send("That has been put into the database")
   }
   });
})



//app.get('/', (req, res) => {
//  res.send('Hello World!')
//}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

