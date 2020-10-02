let username;
let password;
var mysql = require('mysql');
var fs = require('fs');


var con = mysql.createConnection({
  host: "***REMOVED***",
  port: 3306,
  user: "admin",
  password: "***REMOVED***",
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
app.use(session({resave: true, saveUninitialized:true, secret: "***REMOVED***"}));
app.use(express.urlencoded({
  extended: true
}))

app.set('views', __dirname + "/../documentRoot");
app.engine('html', require('ejs').renderFile);
app.set('viewengine', "ejs");

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
    //res.write('<h1>I did find that in the database<h1>');
    if(result[0].User_Type == "Driver"){
        res.render("driverpage.html")
    }
    else if(result[0].User_Type == "Admin"){
      res.render("adminpage.html")
    }
    else if(result[0].User_Type == "Sponsor"){
      res.render("sponsorpage.html")
    }
    res.end();
  }else{
    let login = encodeURIComponent("true");
    res.redirect("/?failedLogin=" + login)
    //res.render("index.ejs", {
    //  test: 'Incorrect Password'
    //});
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
  let username = req.body.create_username;
  username = username.toLowerCase();
  let sql = `INSERT INTO User (Email,First_Name,Last_Name,Username,Password,User_Type) VALUES (
  \"${req.body.email}\",\"${req.body.first_name}\",\"${req.body.last_name}\",
  \"${username}\",\"${req.body.create_password}\",\"Driver\")`;

  con.query(sql, function (err, result) {
   if (err){
    throw err;
   }else{
   	res.send("That has been put into the database")
   }
   });
})

app.get('/', function(req, res){
    res.render('index.ejs',{
      test: req.query.failedLogin
    });
});

//test
//app.get('/', (req, res) => {
//  res.send('Hello World!')
//}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

