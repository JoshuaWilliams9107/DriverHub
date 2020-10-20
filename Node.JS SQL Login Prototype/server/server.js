var mysql = require('mysql');
var fs = require('fs');


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
var request = require("request")
const app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json());
const port = 3000
var session = require("express-session");
var nodemailer = require('nodemailer');
let crypto = require('crypto');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'driverhubautomated@gmail.com',
    pass: '0qtRH4h2D9bA'
  }
});
let EBay = require('ebay-node-api');

let ebay = new EBay({
  clientID: 'AnthonyF-DriverHu-PRD-3e64e9f22-6d602a3c',
  headers:{ // optional
    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' // For Great Britain https://www.ebay.co.uk
  }
});


//email:driverhubautomated@gmail.com
//password:0qtRH4h2D9bA
app.use(session({
  resave: true,
  rolling: true,
  saveUninitialized:true,
  secret: "shhhhhhhhh",
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
    let password = crypto.createHash('md5').update(req.body.password).digest('hex');;
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
function getDrivers(){
  let sql3 = `select * from User where User_Type = "Driver"`;
  return new Promise((resolve,reject) => {con.query(sql3,(err, result) => {
    if (err){
     throw err;
     }
    return err ? reject(err) : resolve(result);
   });
   });
  }
function getUniqueEmail(email){
  let sql2 = `SELECT * FROM User where Email= "${email}"`;
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
function insertCode(email,code){
  let sql2 = `UPDATE User SET Password_Reset="${code}" where email="${email}"`;
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
function updateNewPassword(password,req){
  let sql2 = `UPDATE User SET Password="${password}" where idUser="${req.session.userID}"`;
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
function checkRecovery(code){
  let sql2 = `SELECT * FROM User where Password_Reset= ${code}`;
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
    return err ? reject(err) : resolve(result);
  });
  });
}
app.post('/submit-form-signup', async(req, res) => {
  try {  
    let username = req.body.create_username;
    username = username.toLowerCase();
    let password = crypto.createHash('md5').update(req.body.create_password).digest('hex');
    let numberOfExistingUsers = await getUnique(username);
    console.log(numberOfExistingUsers);
    if(numberOfExistingUsers > 0){
      let login = encodeURIComponent("true");
      res.redirect("/signup?userExists=" + login)
      return;
    }
    let sql = `INSERT INTO User (Email,First_Name,Last_Name,Username,Password,User_Type,Birth_Date) VALUES (
    \"${req.body.email}\",\"${req.body.first_name}\",\"${req.body.last_name}\",
    \"${username}\",\"${password}\",\"${req.body.accountType.charAt(0).toUpperCase() + req.body.accountType.slice(1)}\",\"${req.body.birthday}\")`;

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
app.post('/submit-form-reset-password', async(req, res) => {
  try {  
    let emailExists = await getUniqueEmail(req.body.email);
    if(emailExists == 0){
      let login = encodeURIComponent("true");
      res.redirect("/forgotpassword?userExists=" + login)
      return;
    }
    let randomCode = Math.round(Math.random() * (99999 - 10000) + 10000);
    insertCode(req.body.email,randomCode);
    var mailOptions = {
      from: 'driverhubautomated@gmail.com',
      to: req.body.email,
      subject: 'Forgot DriverHub Password',
      text: `Recovery Code: ${randomCode}`
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect("/recoverycode");
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/submit-form-recover-code', async(req, res) => {
  try {  
    let recover = await checkRecovery(req.body.code);
    console.log(recover[0].Username);
    if(recover.length == 0){
      res.redirect("/recoverycode?code=false");
    }
    req.session.username = recover[0].Username;
    req.session.userID = recover[0].idUser;
    res.redirect("/resetpassword");
    //req.session.username = 
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/submit-form-new-password', async(req, res) => {
  try {  
    let password = crypto.createHash('md5').update(req.body.create_password).digest('hex');
    let newPassword = await updateNewPassword(password,req);
    req.session.username = undefined;
    req.session.userID = undefined;
    res.redirect("/login");
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})

app.get('/login', function(req, res){
    res.render('index.ejs',{
      test: req.query.failedLogin
    });
});
app.get('/forgotpassword', function(req, res){
  res.render('forgotpassword.ejs');
});
app.get('/recoverycode', function(req, res){
  res.render('recoverycode.ejs');
});
app.get('/resetpassword', function(req, res){
  res.render('resetpassword.ejs');
});
app.get('/signup', function(req, res){
  res.render('signup.ejs',{
    userExists: req.query.userExists
  });
});
app.get('/admin', function(req, res){
  getDrivers().then((value) => {
    res.render('adminpage.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      drivers: value
    });
  });
  //let driversobject=getDrivers();
  //res.render('adminpage.ejs',{
  //  username: req.session.username,
  //  userID: req.session.userID
  //});
});
app.get('/driver', function(req, res){
  let pageOffset = '0'
  if(req.query.pageNumber){
    pageOffset = req.query.pageNumber;
  }
  let searchKeyword = "car";
  if(req.query.search){
    searchKeyword = req.query.search;
  }

      ebay.findItemsByKeywords({
          keywords: searchKeyword,
          entriesPerPage: 10,
          pageNumber: parseInt(pageOffset)+1,
          itemFilter:'ListingType:FixedPrice, HideDuplicateItems:1'
      }).then((data) => {
        console.log(data);
        res.render("driverpage.ejs",{
          username: req.session.username,
          userID: req.session.userID,
        ebayObj: data});
          // Data is in format of JSON
          // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.

});
});
app.get('/product', function(req, res){
  let productID = req.query.id;
      ebay.getSingleItem(productID).then((data) => {
        console.log(data);
        res.render("productpage.ejs",{
          username: req.session.username,
          userID: req.session.userID,
          ebayObj: data});
      })
});
app.get('/sponsor', function(req, res){
  res.render('sponsorpage.ejs',{
    username: req.session.username,
    userID: req.session.userID
  });
});
app.get('/',function(req,res){
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