var mysql = require('mysql');


var con = mysql.createConnection({
  host: "***REMOVED***",
  port: 3306,
  user: "admin",
  password: "***REMOVED***",
  database: "sys",
  multipleStatements: true
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const { makeRequest } = require('./node_modules/ebay-node-api/src/request');
const express = require('express')
var request = require("request")
const app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000
var session = require("express-session");
var nodemailer = require('nodemailer');
let crypto = require('crypto');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '***REMOVED***',
    pass: '***REMOVED***'
  }
});
let EBay = require('ebay-node-api');
const { nextTick } = require('process');
const { RSA_NO_PADDING } = require('constants');

let ebay = new EBay({
  clientID: '***REMOVED***',
  headers:{ // optional
    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' // For Great Britain https://www.ebay.co.uk
  }
});


//email:***REMOVED***
//password:***REMOVED***
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
    let relationshipSQL = await sqlStatement(`SELECT * FROM User_To_Company WHERE idUser="${req.session.userID}"`);
    if(relationshipSQL.length > 0){
      req.session.companyID = relationshipSQL[0].Company_Id;
    }
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
app.post('/submit-form-signup-admin', async(req, res) => {
  try {  
    let username = req.body.create_username;
    username = username.toLowerCase();
    let password = crypto.createHash('md5').update(req.body.create_password).digest('hex');
    let numberOfExistingUsers = await sqlStatement(`SELECT * FROM User where Username= "${username}"`);
    if(numberOfExistingUsers.length > 0){
      let login = encodeURIComponent("true");
      res.redirect("/signupAdmin?userExists=" + login)
      return;
    }
    let sql = `INSERT INTO User (Email,First_Name,Last_Name,Username,Password,User_Type,Birth_Date) VALUES (
    \"${req.body.email}\",\"${req.body.first_name}\",\"${req.body.last_name}\",
    \"${username}\",\"${password}\",\"${req.body.accountType.charAt(0).toUpperCase() + req.body.accountType.slice(1)}\",\"${req.body.birthday}\")`;

    con.query(sql, function (err, result) {
    if (err){
      throw err;
    }else{
      res.redirect("/home");
    }
    });
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/submit-form-signup-driver-for-sponsor', async(req, res) => {
  try {  
    let username = req.body.create_username;
    username = username.toLowerCase();
    let password = crypto.createHash('md5').update(req.body.create_password).digest('hex');
    let numberOfExistingUsers = await sqlStatement(`SELECT * FROM User where Username= "${username}"`);
    if(numberOfExistingUsers.length > 0){
      let login = encodeURIComponent("true");
      res.redirect("/signupDriver?userExists=" + login)
      return;
    }
    let sql = `INSERT INTO User (Email,First_Name,Last_Name,Username,Password,User_Type,Birth_Date) VALUES (
    \"${req.body.email}\",\"${req.body.first_name}\",\"${req.body.last_name}\",
    \"${username}\",\"${password}\",\"Driver",\"${req.body.birthday}\")`;
    let signup = await sqlStatement(sql);
    let user = await sqlStatement(`SELECT * FROM User WHERE Username="${username}"`)
    let relationship = await sqlStatement(`INSERT INTO User_To_Company (idUser,Company_Id,Application_Status) VALUES ("${user[0].idUser}","${req.session.companyID}","Complete")`)
    res.redirect("/mysponsor");
  }catch (e) {
    res.end(e.message || e.toString());
  }
})

app.post('/submit-form-addpoints', async(req, res) => {
  try {  
    let userID = req.body.driverID;
    let points = req.body.pointsToAdd;
    
  var d = new Date();
  var n = d.getTime();
  let sql = `INSERT INTO Transaction_history (userid, Time_Purchased, Amount) VALUES (\"${userID}\",\"${n}\",\"${points}\")`
  con.query(sql, function (err, result) {
    if(err){
      throw err;
    }
  });


    con.query(sql, function (err, result) {
    if (err){
      throw err;
    }else{
      res.redirect("http://52.87.231.160/home")
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
      from: '***REMOVED***',
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
      let addRelationship = await sqlStatement(`INSERT INTO User_To_Company (idUser,Company_Id,Application_Status) VALUES (${req.session.userID},${getCompanyID[0].CompanyID},"Complete")`);
      //let updateUser = await sqlStatement(`UPDATE User SET Company_ID="${getCompanyID[0].CompanyID}", Application_Status="Complete" where idUser="${req.session.userID}"`)
      res.redirect("/mysponsor");
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/updateCategories', async(req, res) => {
  try {  
    let outputString = "";
    if(!req.body.Art)
    outputString+=" 550";
    if(!req.body.Books)
    outputString+=" 267";
    if(!req.body.Business_and_Industrial)
    outputString+=" 12576";
    if(!req.body.Cameras_and_Photo)
    outputString+=" 625";
    if(!req.body.Cell_Phones_and_Accessories)
    outputString+=" 15032";
    if(!req.body.Clothing_Shoes_and_Accessories)
    outputString+=" 11450";
    if(!req.body.ComputersTablets_and_Networking)
    outputString+=" 58058";
    if(!req.body.Consumer_Electronics)
    outputString+=" 293";
    if(!req.body.DVDs_and_Movies)
    outputString+=" 11232";
    if(!req.body.Entertainment_Memorabilia)
    outputString+=" 45100";
    if(!req.body.Gift_Cards_and_Coupons)
    outputString+=" 172008";
    if(!req.body.Home_and_Garden)
    outputString+=" 11700";
    if(!req.body.Jewelry_and_Watches)
    outputString+=" 281";
    if(!req.body.Sporting_Goods)
    outputString+=" 888";
    if(!req.body.Sports_Mem_Cards_and_Fan_Shop)
    outputString+=" 64482";
    if(!req.body.Toys_and_Hobbies)
    outputString+=" 220";
    if(!req.body.Video_Games_and_Consoles)
    outputString+=" 1249";
    if(outputString.length > 0){
    outputString = outputString.substring(1);
    }
    console.log(outputString);
    let addRelationship = await sqlStatement(`UPDATE Company SET Catalog_Rule="${outputString}" where CompanyID="${req.session.companyID}"`);
      res.redirect('back');
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
      let addRelationship = await sqlStatement(`INSERT INTO User_To_Company (idUser,Company_Id,Application_Status) VALUES (${req.session.userID},${getCompanyID[0].CompanyID},"Pending")`);
      //let updateUser = await sqlStatement(`UPDATE User SET Company_ID="${getCompanyID[0].CompanyID}", Application_Status="Pending" where idUser="${req.session.userID}"`)
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
        let updateUser = await sqlStatement(`UPDATE User_To_Company SET Application_Status="Complete" where idUser="${req.body.userID}"`)
      }else{
        let updateUser = await sqlStatement(`DELETE FROM User_To_Company where idUser="${req.body.userID}"`)
      }
      res.redirect("/viewApplications");
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})

app.post('/changeActiveCompany', async(req, res) => {
  try {  
    req.session.companyID = req.body.company;
    res.redirect('back');
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
        let relationshipSQL = sqlStatement(`SELECT * FROM User_To_Company WHERE idUser="${req.session.userID}"`).then((companyID) =>{
          let updatePoints = sqlStatement(`UPDATE Company SET Points_To_Dollar=${req.body.Points_to_Dollar} where CompanyID="${companyID[0].Company_Id}"`)
        })
        
     
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
app.post('/checkout', async(req, res) => {
  try {
    // let ebayObjArray = req.body.ebayObjectArr
    // console.log("ebay object array length is: " + ebayObjArray.length)
    // for(let j = 0, leen = ebayObjArray.length; j < leen; j++){
    //   console.log("i'm in the cart!!");
    //   console.log("I am: " + Object.keys(ebayObjArray[j]));
    // } 
    let userName = req.body.userName;
    let pointBalance = parseFloat(req.body.point_balance);
    console.log("Point balance is: " + pointBalance);
      console.log("cart length is: " + req.session.cart.length);
      let ebayObjArray = [];
      for(let i = 0; i < req.session.cart.length; i++){
        ebayObjArray.push(await ebay.getSingleItem(req.session.cart[i]));
      }
      let totalPrice = 0;
      for(let i = 0; i < ebayObjArray.length; i++){
        console.log("current price is: " + parseFloat(ebayObjArray[i].Item.ConvertedCurrentPrice.Value));
        totalPrice = totalPrice + parseFloat(ebayObjArray[i].Item.ConvertedCurrentPrice.Value)
      }
      console.log("the total price is: " + totalPrice);
      if(totalPrice > pointBalance){
        res.send("you don't have enough points");
        return;
      }
      for(let i = 0, len = req.session.cart.length; i < len; i++){
        req.session.cart.splice(0,1);
      }
      let date = new Date().toLocaleString();
      let getUser = await sqlStatement(`SELECT * FROM User WHERE Username = "${userName}"`);
      let insert = await sqlStatement(`INSERT INTO Transaction_history (UserID,Time_Purchased,Amount,Company,UserName) VALUES ("${getUser[0].idUser}","${date}","${totalPrice}","${getUser[0].Company_Id}","${userName}")`);
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
  console.log(req.session.companyID);
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    let sql1 = value;
    
      sqlStatement(`SELECT * from User_To_Company WHERE idUser = ${req.session.userID}`).then((User_To_Company) =>{
        if(User_To_Company[0]){
        sqlStatement(`SELECT * from Company WHERE CompanyID = ${User_To_Company[0].Company_Id}`).then((value) => {
          res.render('mysponsor.ejs',{
            username: req.session.username,
            userID: req.session.userID,
            sqlObj: sql1,
            companySQL : value,
            User_To_Company: User_To_Company,
            companySession: req.session.companyID
          });
        });
      }else{
        res.render('mysponsor.ejs',{
          username: req.session.username,
          userID: req.session.userID,
          sqlObj: sql1,
          User_To_Company: null
      });
      }
      });
    
  });
});
app.get('/addPointsAdmin', function(req, res){
  sqlStatement(`select * from User where User_Type = "Driver"`).then((value) => {
    res.render('admindriverpoint.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      drivers: value
    });
  });
})
app.get('/signupAdmin', function(req, res){
  res.render('signupadmin.ejs',{
    userExists: req.query.userExists
  });
})
app.get('/signupDriver', function(req, res){
  res.render('signupdriverforcompany.ejs',{
    userExists: req.query.userExists
  });
});
app.get('/editCatalog', function(req, res){
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    sqlStatement(`SELECT * from User_To_Company WHERE idUser = ${req.session.userID}`).then((companyID) => {
    let sql1 = value;
    if(companyID){
      sqlStatement(`SELECT * from Company WHERE CompanyID = ${companyID[0].Company_Id}`).then((value) => {
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
});
app.get('/viewApplications', function(req, res){
  sqlStatement(`SELECT * from User_To_Company WHERE idUser = ${req.session.userID}`).then((value) => {
    let sql1 = value;
    if(value[0].Company_Id){
      sqlStatement(`SELECT * from User_To_Company WHERE Company_Id = ${sql1[0].Company_Id} AND Application_Status = "Pending"`).then((value) => {
        let promiseArray = [];
        for(let i = 0; i < value.length; i++){
          let tempPromise = sqlStatement(`SELECT * from User WHERE idUser = ${value[i].idUser}`).then((value) => {
            return value[0];
          });
          promiseArray.push(tempPromise);
        }
        Promise.all(promiseArray).then((array) =>{
          //array is empty for some reason
          console.log(array);
          res.render('viewapplications.ejs',{
            username: req.session.username,
            userID: req.session.userID,
            sqlObj: sql1,
            pendingApplication : array
          });
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
app.get('/reports', function(req, res){
  sqlStatement(`SELECT * from User WHERE idUser = ${req.session.userID}`).then((value) => {
    let sql1 = value;
    res.render("reports.ejs",{
      username: req.session.username,
      report: null
    });
  });
 
})
app.post('/generateReport', async(req, res) => {
  let report_Type = req.body.reportType;
  console.log("report type is: " + report_Type);
  let report = await sqlStatement(`SELECT * FROM Transaction_history`);
  if(report.length == 0){
    res.send("no reports");
  }
  else{
    res.render("reports.ejs",{
      username: req.session.username,
      report: report 
    });
  }
  res.redirect('back');
  return;
})
app.get('/cart', function(req, res){
  //this isn't done
  //need to run getSingleItem a variable amount of times
      getCartInfo(req).then((data) => {
          sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
            sqlStatement(`SELECT * from Company where CompanyID = "${userObj[0].Company_Id}"`).then((companyObj) => {
              sqlStatement(`select Point_Balance from User_To_Company where Company_Id = "${req.session.companyID}" AND idUser = "${req.session.userID}"`).then((value) => {
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
  
    res.render('adminpage.ejs',{
      username: req.session.username,
      userID: req.session.userID,
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
  sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`).then((company) => {
    let catalogRule = "";
    if(company[0].Catalog_Rule){
      catalogRule = company[0].Catalog_Rule + " 99 26395";
    }else{
      catalogRule= "99 26395";
    }
      ebay.findItemsAdvanced({
          keywords: searchKeyword,
          entriesPerPage: 10,
          pageNumber: parseInt(pageOffset)+1,
          ExcludeCategory: catalogRule
      }).then((data) => {
          sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
            sqlStatement(`select * from User_To_Company where Company_Id = "${req.session.companyID}" AND idUser = "${req.session.userID}"`).then((value) => {
            if(value[0].Application_Status == "Complete"){
              sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`).then((companyObj) => {
               
                
                for(let i = 0; i < data[0].searchResult[0].item.length; i++){
                  data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__ = (companyObj[0].Points_to_Dollar*parseFloat(data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__)).toFixed(2);
                }

                res.render("driverpage.ejs",{
                  username: req.session.username,
                  userID: req.session.userID,
                  userBalance: value[0].Point_Balance,
                  ebayObj: data,
                  companySQL: companyObj,
                  userSQL: value});
                // Data is in format of JSON
                // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
              });
            }else{
            res.render("driverpage.ejs",{
              username: req.session.username,
              userID: req.session.userID,
              userBalance: value[0].Point_Balance,
              ebayObj: data,
              companySQL: null,
              userSQL: value});
            // Data is in format of JSON
            // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
          }
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
              sqlStatement(`select Point_Balance from User_To_Company where Company_Id = "${req.session.companyID}" AND idUser = "${req.session.userID}"`).then((value) => {
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
app.get('/profile', function(req,res){
  res.render('profile.ejs',{
    username: req.session.username,
    userID: req.session.userID,
  });
})
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
    res.redirect("/home");
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