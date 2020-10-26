var mysql = require('mysql');
var fs = require('fs');


var con = mysql.createConnection({
  host: "database-2.crbonmxqlhis.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "wZ!2o4PKj",
  database: "sys",
  multipleStatements: true
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
const { nextTick } = require('process');

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
  if(req.session.submitNumber < 5){
    let username = req.body.username;
    let password = crypto.createHash('md5').update(req.body.password).digest('hex');;
    let userType = await sqlStatement(`SELECT * FROM User WHERE Username= "${username}" AND Password= "${password}"`);
    if(userType.length == 0){
      let login = encodeURIComponent("true");
      req.session.submitNumber +=1;
      res.redirect("/login?failedLogin=" + login)
      return;
    }else
    req.session.username = username;
    req.session.userID = userType[0].idUser;
    req.session.userType = userType[0].User_Type;
    return res.redirect("/home");
    }else{
      res.send("Too many login attempts, please try again later");
    }
  //if(result[0].username == user){
  //  console.log(username);
  //  console.log(password);
  //}
})
function sqlStatement(sqlCommand){
  return new Promise((resolve,reject) => {con.query(sqlCommand,(err, result) => {
    if (err){
     throw err;
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
    let numberOfExistingUsers = await sqlStatement(`SELECT * FROM User where Username= "${username}"`);
    if(numberOfExistingUsers.length > 0){
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

app.post('/submit-form-addpoints', async(req, res) => {
  try {  
    let userID = req.body.driverID;
    let points = req.body.pointsToAdd;
    let sql = `UPDATE User SET Point_Balance = Point_Balance + ${points} WHERE idUser = ${userID}`

    con.query(sql, function (err, result) {
    if (err){
      throw err;
    }else{
      res.redirect("http://localhost:3000/admin?fname=")
    }
    });
  }catch (e) {
    res.end(e.message || e.toString());
  }
})

app.post('/submit-form-reset-password', async(req, res) => {
  try {  
    let emailObj = await sqlStatement(`SELECT * FROM User where Email= "${req.body.email}"`);
    if(emailObj.length == 0){
      let login = encodeURIComponent("true");
      res.redirect("/forgotpassword?userExists=" + login)
      return;
    }
    let randomCode = Math.round(Math.random() * (99999 - 10000) + 10000);
    sqlStatement(`UPDATE User SET Password_Reset="${randomCode}" where email="${req.body.email}"`);
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
    let recover = await sqlStatement(`SELECT * FROM User where Password_Reset= ${req.body.code}`);
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
    let newPassword = await sqlStatement(`UPDATE User SET Password="${password}" where idUser="${req.session.userID}"`);
    req.session.username = undefined;
    req.session.userID = undefined;
    res.redirect("/login");
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/create-company', async(req, res) => {
  try {  
      //Create a company row in the company database with the company's information (check)
      //Update the current user's Company_Id to reflect that of the new company, also update application_status to accepted
      //Application status = {Pending|Complete}
      let randomCode = Math.round(Math.random() * (99999 - 10000) + 10000);
      let insert = await sqlStatement(`INSERT INTO Company (Company_Name,Company_Address,Company_Invite_Code) VALUES ("${req.body.Company_Name}","${req.body.Company_Address}",${randomCode})`);
      let getCompanyID = await sqlStatement(`SELECT * FROM Company WHERE Company_Name = "${req.body.Company_Name}"`);
      let updateUser = await sqlStatement(`UPDATE User SET Company_ID="${getCompanyID[0].CompanyID}", Application_Status="Complete" where idUser="${req.session.userID}"`)
      res.redirect("/mysponsor");
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})

app.post('/join-company', async(req, res) => {
  try {  
      //Find's the company ID associated with the join code
      //updates calling user's company ID and application_Status to Pending
      let getCompanyID = await sqlStatement(`SELECT * FROM Company WHERE Company_Invite_Code = "${req.body.Company_Invite_Code}"`);
      let updateUser = await sqlStatement(`UPDATE User SET Company_ID="${getCompanyID[0].CompanyID}", Application_Status="Pending" where idUser="${req.session.userID}"`)
      res.redirect("/mysponsor");
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/updateApplication', async(req, res) => {
  try {  
      //Find's the company ID associated with the join code
      //updates calling user's company ID and application_Status to Pending

      if(req.body.decision == "Accept"){
        let updateUser = await sqlStatement(`UPDATE User SET Application_Status="Complete" where idUser="${req.body.userID}"`)
      }else{
        let updateUser = await sqlStatement(`UPDATE User SET Application_Status=NULL,Company_Id=NULL where idUser="${req.body.userID}"`)
      }
      res.redirect("/viewApplications");
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/updatePointExchange', async(req, res) => {
  try {  
      //Find's the company ID associated with the join code
      //updates calling user's company ID and application_Status to Pending
        let updatePoints = await sqlStatement(`UPDATE Company SET Points_To_Dollar=${req.body.Points_to_Dollar} where CompanyID="${req.body.companyID}"`)
     
      res.redirect("/editCatalog");
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/addToCart', async(req, res) => {
  try {  
        if(!req.session.cart){
          req.session.cart = [];
        }
        req.session.cart.push(req.body.itemID);
        console.log(req.session.cart);
        res.redirect('back');
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/removeFromCart', async(req, res) => {
  try {  
        req.session.cart.splice(req.body.index,1);
        res.redirect('back');
      return;
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
app.get('/signup', function(req, res){
  res.render('signup.ejs',{
    userExists: req.query.userExists
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
app.get('/logout', function(req, res){
  req.session.username = null;
  req.session.userID = null;
  req.session.userType = null;
  req.session.cart = null;
  res.redirect("/login");
});
app.get('*', function(req, res, next){
  if(!req.session.userID){
  if(req.path != "/" || req.path != "/login" || req.path != "/signup" || req.path != "/logout"){
    return res.redirect("/login");
  }
  }else{
    return next();
  }
});
app.get('/mysponsor', function(req, res){
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    let sql1 = value;
    if(value[0].Company_Id){
      sqlStatement(`SELECT * from Company WHERE CompanyID = ${sql1[0].Company_Id}`).then((value) => {
        res.render('mysponsor.ejs',{
            username: req.session.username,
            userID: req.session.userID,
            sqlObj: sql1,
            companySQL : value
        });
      });
    }else{
      res.render('mysponsor.ejs',{
        username: req.session.username,
        userID: req.session.userID,
        sqlObj: sql1
    });
    }
  });
});
app.get('/editCatalog', function(req, res){
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    let sql1 = value;
    if(value[0].Company_Id){
      sqlStatement(`SELECT * from Company WHERE CompanyID = ${sql1[0].Company_Id}`).then((value) => {
        res.render('editcatalog.ejs',{
            username: req.session.username,
            userID: req.session.userID,
            sqlObj: sql1,
            companySQL : value
        });
      });
    }else{
      res.redirect("/home");
    }
  });
});
app.get('/viewApplications', function(req, res){
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    let sql1 = value;
    if(value[0].Company_Id){
      sqlStatement(`SELECT * from User WHERE Company_Id = ${sql1[0].Company_Id} AND Application_Status = "Pending"`).then((value) => {
        res.render('viewapplications.ejs',{
            username: req.session.username,
            userID: req.session.userID,
            sqlObj: sql1,
            pendingApplication : value
        });
      });
    }else{
      res.redirect("/home");
    }
  });
});
app.get('/joincompany', function(req, res){
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    res.render('joincompany.ejs',{
        username: req.session.username,
        userID: req.session.userID,
        sqlObj: value
    });
  });
});
app.get('/createcompany', function(req, res){
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    res.render('createcompany.ejs',{
        username: req.session.username,
        userID: req.session.userID,
        sqlObj: value
    });
  });
});
app.get('/cart', function(req, res){
  //this isn't done
  //need to run getSingleItem a variable amount of times
      getCartInfo(req).then((data) => {
          sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
            sqlStatement(`SELECT * from Company where CompanyID = "${userObj[0].Company_Id}"`).then((companyObj) => {
              sqlStatement(`select Point_Balance from User where idUser = "${req.session.userID}"`).then((value) => {
                if(data){
                  for(let i = 0; i < data.length; i++){
                    data[i].Item.ConvertedCurrentPrice.Value = (companyObj[0].Points_to_Dollar*data[i].Item.ConvertedCurrentPrice.Value).toFixed(2);
                  }
                }
                console.log(data);
                res.render("cart.ejs",{
                  username: req.session.username,
                  userID: req.session.userID,
                  userBalance: value[0].Point_Balance,
                  ebayObj: data,
                  companySQL: companyObj});
              });
            });
          });
      });
    });
async function getCartInfo(req){
  let ebayObjArray = [];
  if(!req.session.cart){
    return null;
  }
  for(let i = 0; i < req.session.cart.length; i++){
    ebayObjArray.push(await ebay.getSingleItem(req.session.cart[i]));
  }
  return ebayObjArray;
}
function adminPage(req,res){
  sqlStatement(`select * from User where User_Type = "Driver"`).then((value) => {
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
}
app.get('/home', function(req, res){
  if(req.session.userType == "Driver"){
    return driverPage(req,res);
  }else if(req.session.userType == "Sponsor"){
    return sponsorPage(req,res);
  }else if(req.session.userType == "Admin"){
    return adminPage(req,res);
  }
});
function driverPage(req, res){
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
          sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
            sqlStatement(`SELECT * from Company where CompanyID = "${userObj[0].Company_Id}"`).then((companyObj) => {
              sqlStatement(`select Point_Balance from User where idUser = "${req.session.userID}"`).then((value) => {
                for(let i = 0; i < data[0].searchResult[0].item.length; i++){
                  data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__ = (companyObj[0].Points_to_Dollar*parseFloat(data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__)).toFixed(2);
                }
                res.render("driverpage.ejs",{
                  username: req.session.username,
                  userID: req.session.userID,
                  userBalance: value[0].Point_Balance,
                  ebayObj: data,
                  companySQL: companyObj});
                // Data is in format of JSON
                // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
              });
            });
          });
        });
}
app.get('/product', function(req, res){
  let productID = req.query.id;
      ebay.getSingleItem(productID).then((data) => {
          sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
            sqlStatement(`SELECT * from Company where CompanyID = "${userObj[0].Company_Id}"`).then((companyObj) => {
              sqlStatement(`select Point_Balance from User where idUser = "${req.session.userID}"`).then((value) => {
                data.Item.ConvertedCurrentPrice.Value = (companyObj[0].Points_to_Dollar*data.Item.ConvertedCurrentPrice.Value).toFixed(2);
                res.render("productpage.ejs",{
                  username: req.session.username,
                  userID: req.session.userID,
                  userBalance: value[0].Point_Balance,
                  ebayObj: data,
                  companySQL: companyObj});
                // Data is in format of JSON
                // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
              });
            });
          });
  });
});
function sponsorPage(req,res){
  sqlStatement(`select * from User where User_Type = "Driver"`).then((value) => {
    res.render('sponsorpage.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      drivers: value
    });
  });
}
app.get('/',function(req,res){
  if(req.session.userID){
    res.redirect("/driver");
  }else{
    res.redirect("/login");
  }
});


//test
//app.get('/', (req, res) => {
//  res.send('Hello World!')
//}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})