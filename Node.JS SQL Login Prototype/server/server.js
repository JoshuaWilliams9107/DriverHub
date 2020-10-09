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
var request = require("request")
const app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json());
const port = 3000
var session = require("express-session");
app.use(session({
  resave: true,
  rolling: true,
  saveUninitialized:true,
  secret: "***REMOVED***",
  cookie: {
    expires: 60000 * 5
  }
  })
   );
app.use(express.urlencoded({
  extended: true
}))

app.set('views', __dirname + "/../documentRoot");
app.engine('html', require('ejs').renderFile);
app.set('viewengine', "ejs");

app.post('/submit-form', async(req, res) => {
  if(!req.session.submitNumber){
    req.session.submitNumber = 0;
  }
  console.log(req.session.submitNumber);
  if(req.session.submitNumber < 5){
    let username = req.body.username;
    let password = req.body.password;
    let userType = await getUserType(username,password);
    if(userType === false){
      let login = encodeURIComponent("true");
      req.session.submitNumber +=1;
      res.redirect("/login?failedLogin=" + login)
      return;
    }else
    req.session.username = username;
    req.session.userID = userType[0].idUser;
      if(userType[0].User_Type == "Driver"){
        return res.redirect("/driver");
      }else if(userType[0].User_Type == "Admin"){
        return res.redirect("/admin");
      }else if(userType[0].User_Type == "Sponsor"){
        return res.redirect("/sponsor");
      }
    }else{
      res.send("Too many login attempts, please try again later");
    }
  //if(result[0].username == user){
  //  console.log(username);
  //  console.log(password);
  //}
})
function getUserType(username,password){
  let sql = `SELECT * FROM User WHERE Username= "${username}" AND Password= "${password}"`;
  return new Promise((resolve,reject) => {con.query(sql,(err, result) => {
    if (err){
      throw err;
    }if(result.length != 0){
     return err ? reject(err) : resolve(result);
   }else{
    return err ? reject(err) : resolve(false);
   }
  });
  });
}
function getUnique(username){
  let sql2 = `SELECT * FROM User where Username= "${username}"`;
  return new Promise((resolve,reject) => {con.query(sql2,(err, result) => {
   let isUnique = false;
   if (err){
    throw err;
    }else{
        if(result.length > 0){
          isUnique = false;
        }else{
          isUnique = true;
        }
    }
    return err ? reject(err) : resolve(result.length);
  });
  });
}
app.post('/submit-form-signup', async(req, res) => {
  try {  
    let username = req.body.create_username;
    username = username.toLowerCase();
    let numberOfExistingUsers = await getUnique(username);
    console.log(numberOfExistingUsers);
    if(numberOfExistingUsers > 0){
      let login = encodeURIComponent("true");
      res.redirect("/signup?userExists=" + login)
      return;
    }
    let sql = `INSERT INTO User (Email,First_Name,Last_Name,Username,Password,User_Type) VALUES (
    \"${req.body.email}\",\"${req.body.first_name}\",\"${req.body.last_name}\",
    \"${username}\",\"${req.body.create_password}\",\"Driver\")`;

    con.query(sql, function (err, result) {
    if (err){
      throw err;
    }else{
      res.redirect("/login")
    }
    });
  }catch (e) {
    res.end(e.message || e.toString());
  }
})

app.get('/login', function(req, res){
    res.render('index.ejs',{
      test: req.query.failedLogin
    });
});
app.get('/signup', function(req, res){
  res.render('signup.ejs',{
    userExists: req.query.userExists
  });
});
app.get('/admin', function(req, res){
  res.render('adminpage.ejs',{
    username: req.session.username,
    userID: req.session.userID
  });
});
app.get('/driver', function(req, res){
  res.render('driverpage.ejs',{
    username: req.session.username,
    userID: req.session.userID
  });
});
app.get('/sponsor', function(req, res){
  res.render('sponsorpage.ejs',{
    username: req.session.username,
    userID: req.session.userID
  });
});
app.get('',function(req,res){
  if(req.session.userID){
    res.redirect("/driver");
  }else{
    res.redirect("/login");
  }
})
app.get('/logout', function(req, res){
  req.session.username = null;
  req.session.userID = null;
  res.redirect("/login");
});

//test
//app.get('/', (req, res) => {
//  res.send('Hello World!')
//}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})