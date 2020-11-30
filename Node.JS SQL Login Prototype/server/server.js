var mysql = require('mysql');


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
    user: 'driverhubautomated@gmail.com',
    pass: '0qtRH4h2D9bA'
  }
});
let EBay = require('ebay-node-api');
const { nextTick } = require('process');
const { RSA_NO_PADDING } = require('constants');

let ebay = new EBay({
  clientID: 'AnthonyF-DriverHu-PRD-3e64e9f22-6d602a3c',
  headers:{ // optional
    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' // For Great Britain https://www.ebay.co.uk
  }
});


//email:driverhubautomated@gmail.com
//password:0qtRH4h2D9bA
app.use('/img',express.static(__dirname + '/img'))
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
app.post('/changeUserType', async(req, res) => {
  try {  
    if(req.body.usertype == "Sponsor"){
      let relationshipSQL = await sqlStatement(`SELECT * FROM User_To_Company WHERE idUser="${req.session.userID}"`);
      if(relationshipSQL.length > 0){
        req.session.companyID = relationshipSQL[0].Company_Id;
      }
      req.session.userType = "Sponsor";
      res.redirect("/home");
    }else if(req.body.usertype == "Driver"){
      let relationshipSQL = await sqlStatement(`SELECT * FROM User_To_Company WHERE idUser="${req.session.userID}"`);
      if(relationshipSQL.length > 0){
        req.session.companyID = relationshipSQL[0].Company_Id;
      }
      let changePointBalance = await sqlStatement(`UPDATE User_To_Company SET Point_Balance=100000 WHERE idUser=${req.session.userID}`)
      req.session.userType = "Driver";
      res.redirect("/home");
    }else if(req.body.usertype == "Admin"){
      req.session.companyID = null;
      req.session.userType = "Admin";
      res.redirect("/home");
    }
    
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
  let insettransaction = sqlStatement(`INSERT INTO Transaction_history (userid, Time_Purchased, Amount) VALUES (\"${userID}\",\"${n}\",\"${points}\")`);
  let updateDriverPoint = sqlStatement(`UPDATE User_To_Company SET Point_Balance = Point_Balance + ${points} where idUser ="${userID}" and Company_Id="${req.body.companyID}"`).then((value) =>{
    res.redirect('back');
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
app.post('/join-company-admin', async(req, res) => {
  try {  
      //Find's the company ID associated with the join code
      //updates calling user's company ID and application_Status to Pending
      let getCompanyID = await sqlStatement(`SELECT * FROM Company WHERE Company_Invite_Code = "${req.body.Company_Invite_Code}"`);
      let addRelationship = await sqlStatement(`INSERT INTO User_To_Company (idUser,Company_Id,Application_Status) VALUES (${req.body.userID},${getCompanyID[0].CompanyID},"Complete")`);
      //let updateUser = await sqlStatement(`UPDATE User SET Company_ID="${getCompanyID[0].CompanyID}", Application_Status="Pending" where idUser="${req.session.userID}"`)
      res.redirect("back");
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
app.post('/addToBlacklist', async(req, res) => {
  try {  
        console.log(`Removed ${req.body.itemID}`)
        let blacklist = await sqlStatement(`INSERT INTO Item_BlackList (itemID,CompanyID,itemTitle) VALUES (${req.body.itemID},${req.session.companyID},"${req.body.itemTitle}")`);
        res.redirect('/home');
      return;
    return;
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/removeFromBlacklist', async(req, res) => {
  try {  
        let blacklist = await sqlStatement(`DELETE FROM Item_BlackList WHERE Item_Blacklist_ID=${req.body.blacklistID}`);
        res.redirect('back');
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
      companyObj = await sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`);
        for(let i = 0; i < ebayObjArray.length; i++){
          ebayObjArray[i].Item.ConvertedCurrentPrice.Value = (companyObj[0].Points_to_Dollar*parseFloat(ebayObjArray[i].Item.ConvertedCurrentPrice.Value)).toFixed(2);
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
        pointBalance = pointBalance-totalPrice;
        let date = new Date().toLocaleString();
        let getUser = await sqlStatement(`SELECT * FROM User WHERE Username = "${userName}"`);
        let insert = await sqlStatement(`INSERT INTO Transaction_history (UserID,Time_Purchased,Amount,Company,UserName) VALUES ("${getUser[0].idUser}","${date}","${totalPrice}","${getUser[0].Company_Id}","${userName}")`);
        let update = await sqlStatement(`UPDATE User_To_Company SET Point_Balance=${pointBalance} WHERE idUser=${req.session.userID} AND Company_Id=${req.session.companyID};`)
        res.redirect('back');
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

app.post('/edit-profile', async(req, res) => {
  //Need to do some validation here
  sqlStatement(`UPDATE User SET First_Name="${req.body.First_Name}",Last_Name="${req.body.Last_Name}",Birth_Date="${req.body.Birth_Date}" where Username="${req.body.Username}"`).then((value) =>{
    console.log(req.body.Username);
    console.log(req.session.username);
    if(req.body.Username.toLowerCase() != req.session.username.toLowerCase()){
      res.redirect(`/manageProfile?Username=${req.body.Username}`);
    }else{
      res.redirect(`/profile`);
    }
  });
})

app.post('/editUsername', async(req, res) => {
  //Need to do validation with session
  try {  
    let username = req.body.create_username;
    username = username.toLowerCase();
    let numberOfExistingUsers = await sqlStatement(`SELECT * FROM User where Username= "${username}"`);
    if(numberOfExistingUsers.length > 0){
      let login = encodeURIComponent("true");
      if(req.body.userID != req.session.userID){
        res.redirect(`/editAccountS?userExists=${login}&Username=${req.body.oUsername}`);
      }else{
        res.redirect(`/editAccount?userExists=${login}`);
      }
      
      return;
    }
    if(req.session.userID == req.body.userID){
      req.session.username = username;
    }
    sqlStatement(`UPDATE User SET Username="${username}" where idUser="${req.body.userID}"`).then((value) =>{
      if(req.body.userID != req.session.userID){
        res.redirect(`/editAccountS?&Username=${username}`);
      }else{
        res.redirect(`/editAccount`);
      }
    });
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/editEmail', async(req, res) => {
  //Need to do validation with session
  try {  
    sqlStatement(`UPDATE User SET Email="${req.body.email}" where idUser="${req.body.userID}"`).then((value) =>{
      if(req.body.userID != req.session.userID){
        res.redirect(`/editAccountS?Username=${req.body.oUsername}`);
      }else{
        res.redirect(`/editAccount`);
      }
    });
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/editCompanyName', async(req, res) => {
  try {  
    sqlStatement(`UPDATE Company SET Company_Name="${req.body.Company_Name}" where CompanyID="${req.body.CompanyID}"`).then((value) =>{
      res.redirect('back');
    });
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/deleteCompany', async(req, res) => {
  let waitDelete = await sqlStatement(`DELETE FROM Company where CompanyID="${req.body.CompanyID}"`);
  let waitDeleteRelationships = await sqlStatement(`DELETE FROM User_To_Company where Company_Id="${req.body.CompanyID}"`); 
  res.redirect('/manageSponsors');
})
app.post('/editCompanyAddress', async(req, res) => {
  try {  
    sqlStatement(`UPDATE Company SET Company_Address="${req.body.Company_Address}" where CompanyID="${req.body.CompanyID}"`).then((value) =>{
      res.redirect('back');
    });
  }catch (e) {
    res.end(e.message || e.toString());
  }
})
app.post('/editPassword', async(req, res) => {
  //Need to do validation with session
  try {  
    let password = crypto.createHash('md5').update(req.body.create_password).digest('hex');
    sqlStatement(`UPDATE User SET Password="${password}" where idUser="${req.body.userID}"`).then((value) =>{
      if(req.body.userID != req.session.userID){
        res.redirect(`/editAccountS?Username=${req.body.oUsername}`);
      }else{
        res.redirect(`/editAccount`);
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
  req.session.companyID=null;
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
            userType: req.session.userType,
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
          userType: req.session.userType,
          User_To_Company: null
      });
      }
      });
    
  });
});
app.get('/editCompany', function(req, res){
  console.log(req.session.companyID);
      sqlStatement(`SELECT * from Company WHERE CompanyID = ${req.session.companyID}`).then((value) => {
          res.render('editcompany.ejs',{
            username: req.session.username,
            userID: req.session.userID,
            companySQL : value,
          });
        });
});
app.get('/editCompanyA', function(req, res){
  console.log(req.session.companyID);
      sqlStatement(`SELECT * from Company WHERE CompanyID = ${req.query.CompanyID}`).then((value) => {
          res.render('editcompanyA.ejs',{
            username: req.session.username,
            userID: req.session.userID,
            companySQL : value,
          });
        });
});

app.get('/addPointsAdmin', function(req, res){
  sqlStatement(`SELECT * from User_To_Company`).then((value)=>{
    let promiseArray = [];
    for(let i = 0; i < value.length; i++){
      let tempPromise = sqlStatement(`SELECT * from User WHERE idUser = ${value[i].idUser}`).then((value) => {
        if(value[0].User_Type == "Driver"){
          return value[0];
        }else{
          return null;
        }
      });
      promiseArray.push(tempPromise);
    }
    let promiseArray2 = [];
    for(let i = 0; i < value.length; i++){
      let tempPromise = sqlStatement(`SELECT * from Company WHERE CompanyID = ${value[i].Company_Id}`).then((value) => {
          return value[0];
      });
      promiseArray2.push(tempPromise);
    }
    Promise.all(promiseArray).then((array) =>{
      Promise.all(promiseArray2).then((array2) =>{
        for(let i = 0; i < array.length; i++){
          if(array[i] == null){
            array.splice(i,1);
            value.splice(i,1);
            array2.splice(i,1);
          }
        }
        //array is empty for some reason
        console.log(value);
        res.render('admindriverpoint.ejs',{
          username: req.session.username,
          userID: req.session.userID,
          drivers: array,
          Driver_To_Company: value,
          CompanyArr: array2
        });
      });
    });
});
})
app.get('/addPointsSponsor', function(req, res){
  sqlStatement(`SELECT * from User_To_Company where Company_Id = "${req.session.companyID}"`).then((value)=>{
    let promiseArray = [];
    for(let i = 0; i < value.length; i++){
      let tempPromise = sqlStatement(`SELECT * from User WHERE idUser = ${value[i].idUser}`).then((value) => {
        if(value[0].User_Type == "Driver"){
          return value[0];
        }else{
          return null;
        }
        
      });
      promiseArray.push(tempPromise);
    }
    Promise.all(promiseArray).then((array) =>{
        for(let i = 0; i < array.length; i++){
          if(array[i] == null){
            array.splice(i,1);
            value.splice(i,1);
          }
        }
        //array is empty for some reason
        console.log(value);
        res.render('sponsordriverpoint.ejs',{
          username: req.session.username,
          userID: req.session.userID,
          drivers: array,
          Driver_To_Company: value,
        });
    });
});
})
app.get('/manageDrivers', function(req, res){
  sqlStatement(`SELECT * from User_To_Company where Company_Id = "${req.session.companyID}"`).then((value)=>{
    let promiseArray = [];
    for(let i = 0; i < value.length; i++){
      let tempPromise = sqlStatement(`SELECT * from User WHERE idUser = ${value[i].idUser}`).then((value) => {
        if(value[0].User_Type == "Driver"){
          return value[0];
        }else{
          return null;
        }
        
      });
      promiseArray.push(tempPromise);
    }
    Promise.all(promiseArray).then((array) =>{
        for(let i = 0; i < array.length; i++){
          if(array[i] == null){
            array.splice(i,1);
            value.splice(i,1);
          }
        }
        //array is empty for some reason
        //console.log(value);
        res.render('managedrivers.ejs',{
          username: req.session.username,
          userID: req.session.userID,
          drivers: array,
          Driver_To_Company: value,
        });
    });
});
})
app.get('/manageUsers', function(req, res){
  sqlStatement(`SELECT * from User`).then((value)=>{
        //array is empty for some reason
        res.render('manageusers.ejs',{
          username: req.session.username,
          userID: req.session.userID,
          drivers: value
        });
    });
});
app.get('/manageSponsors', function(req, res){
  sqlStatement(`SELECT * from Company`).then((value)=>{
        //array is empty for some reason
        res.render('managesponsors.ejs',{
          username: req.session.username,
          userID: req.session.userID,
          sponsors: value
        });
    });
});

app.get('/signupAdmin', function(req, res){
  res.render('signupadmin.ejs',{
    userExists: req.query.userExists
  });
})
app.get('/manageProfile', function(req, res){
  sqlStatement(`select * from User where Username = "${req.query.Username}"`).then((value) => {
    sqlStatement(`select * FROM User_To_Company WHERE idUser=${value[0].idUser}`).then((sponsorInfo) =>{
      console.log(sponsorInfo);
      
      let promiseArray = [];
        for(let i = 0; i < sponsorInfo.length; i++){
          let tempPromise = sqlStatement(`SELECT * from Company WHERE CompanyID = ${sponsorInfo[i].Company_Id}`).then((value) => {
            return value[0];
          });
          promiseArray.push(tempPromise);
        }
      Promise.all(promiseArray).then((array) =>{
        res.render('manageprofile.ejs',{
          username: req.session.username,
          userID: req.session.userID,
          userObj: value,
          userType: req.session.userType,
          sponsorInfo: array
        });
      });
      
    });

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
app.get('/editProfile', function(req, res){
  sqlStatement(`select * from User where Username = "${req.session.username}"`).then((value) => {
    res.render('editprofile.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      userObj: value
    });
  });
})
app.get('/editProfileS', function(req, res){
  sqlStatement(`select * from User where Username = "${req.query.Username}"`).then((value) => {
    res.render('editprofile.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      userObj: value
    });
  });
})
app.get('/editAccount', function(req, res){
  sqlStatement(`select * from User where Username = "${req.session.username}"`).then((value) => {
    res.render('editaccount.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      userObj: value,
      userExists: req.query.userExists
    });
  });
})
app.get('/editAccountS', function(req, res){
  sqlStatement(`select * from User where Username = "${req.query.Username}"`).then((value) => {
    res.render('editaccount.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      userObj: value,
      userExists: req.query.userExists
    });
  });
});
app.post('/deleteAccount', async(req, res) => {
  
  if(req.session.userType == "Admin"){
    if(req.body.type == "deleteUser"){
      let waitDelete = await sqlStatement(`DELETE FROM User where idUser="${req.body.userID}"`);
      let waitDelet2 = await sqlStatement(`DELETE FROM User_To_Company where idUser="${req.body.userID}"`);
      res.redirect('/manageUsers');
    }else if(req.body.type == "removeFromCompany"){
      let waitDelete = await sqlStatement(`SELECT * FROM User_To_Company where idUser="${req.body.userID}" and Company_Id="${req.body.CompanyID}"`);
      let waitDelete2 = await sqlStatement(`DELETE FROM User_To_Company where id="${waitDelete[0].Id}"`);
      res.redirect('back');
    }
  }else{
    let waitDelete = await sqlStatement(`SELECT * FROM User_To_Company where idUser="${req.body.userID}" and Company_Id="${req.session.companyID}"`);
    let waitDelete2 = await sqlStatement(`DELETE FROM User_To_Company where id="${waitDelete[0].Id}"`);
    res.redirect('/manageDrivers');
  }
  
});
app.post('/generateReport', async(req, res) => {
  let report_Type = req.body.reportType;
  console.log("report type is: " + report_Type);
  let report = await sqlStatement(`SELECT * FROM Transaction_history`);
  if(report.length == 0){
    return res.send("no reports");
  }
  else{
    return res.render("reports.ejs",{
      username: req.session.username,
      report: report 
    });
  }
  res.redirect('back');
  return;
})
app.get('/cart', function(req, res){
      getCartInfo(req).then((data) => {
          sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
            sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`).then((companyObj) => {
              sqlStatement(`select Point_Balance from User_To_Company where Company_Id = "${req.session.companyID}" AND idUser = "${req.session.userID}"`).then((value) => {
                if(data){
                  for(let i = 0; i < data.length; i++){
                    data[i].Item.ConvertedCurrentPrice.Value = (companyObj[0].Points_to_Dollar*data[i].Item.ConvertedCurrentPrice.Value).toFixed(2);
                  }
                }
                console.log(data);
                if(value.length > 0){
                res.render("cart.ejs",{
                  username: req.session.username,
                  userType: req.session.userType,
                  userObj:userObj,
                  userID: req.session.userID,
                  userBalance: value[0].Point_Balance,
                  ebayObj: data,
                  companySQL: companyObj});
              
              }else{
                res.render("cart.ejs",{
                  username: req.session.username,
                  userType: req.session.userType,
                  userObj:userObj,
                  userID: req.session.userID,
                  userBalance: 0,
                  ebayObj: data,
                  companySQL: companyObj});
              }
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
  sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
    res.render('adminpage.ejs',{
      username: req.session.username,
      userID: req.session.userID,
      userObj:userObj[0],
      userType: req.session.userType
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
  sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`).then((company) => {
    let catalogRule = "";
    if(company.length > 0){
      if(company[0].Catalog_Rule){
        catalogRule = company[0].Catalog_Rule + " 99 26395";
      }else{
        catalogRule= "99 26395";
      }
    }
    sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
      if(company.length == 0){
          res.render("driverpage.ejs",{
            username: req.session.username,
            userObj:userObj[0],
            userType: req.session.userType,
            userID: req.session.userID,
            userBalance: 0,
            ebayObj: null,
            companySQL: null,
            userSQL: null});
          // Data is in format of JSON
          // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
      }else{
      ebay.findItemsAdvanced({
          keywords: searchKeyword,
          entriesPerPage: 10,
          pageNumber: parseInt(pageOffset)+1,
          ExcludeCategory: catalogRule
      }).then((data) => {
          
            sqlStatement(`select * from User_To_Company where Company_Id = "${req.session.companyID}" AND idUser = "${req.session.userID}"`).then((value) => {
            if(value[0].Application_Status == "Complete"){
              sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`).then((companyObj) => {
                sqlStatement(`SELECT * FROM Item_BlackList WHERE CompanyID=${req.session.companyID};`).then((blacklist) => {
                
                  for(let i = 0; i < data[0].searchResult[0].item.length; i++){
                    data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__ = (companyObj[0].Points_to_Dollar*parseFloat(data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__)).toFixed(2);
                    for(let j = 0; j < blacklist.length; j++){
                      if(data[0].searchResult[0].item[i].itemId[0] == blacklist[j].itemID){
                        console.log("removed item");
                        data[0].searchResult[0].item.splice(i, 1);
                        i--;
                        break;
                      }
                    }
                    
                  }

                  res.render("driverpage.ejs",{
                    username: req.session.username,
                    userObj:userObj[0],
                    userType: req.session.userType,
                    userID: req.session.userID,
                    userBalance: value[0].Point_Balance,
                    ebayObj: data,
                    companySQL: companyObj,
                    userSQL: value});
                  // Data is in format of JSON
                  // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
                 });
              });
            }else{
            res.render("driverpage.ejs",{
              username: req.session.username,
              userObj:userObj[0],
              userType: req.session.userType,
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
        }
        });
      });

      
}
app.get('/product', function(req, res){
  let productID = req.query.id;
      ebay.getSingleItem(productID).then((data) => {
          sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
            sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`).then((companyObj) => {
              sqlStatement(`select Point_Balance from User_To_Company where Company_Id = "${req.session.companyID}" AND idUser = "${req.session.userID}"`).then((value) => {
                data.Item.ConvertedCurrentPrice.Value = (companyObj[0].Points_to_Dollar*data.Item.ConvertedCurrentPrice.Value).toFixed(2);
                res.render("productpage.ejs",{
                  username: req.session.username,
                  userType: req.session.userType,
                  userID: req.session.userID,
                  userObj: userObj,
                  userBalance: value[0].Point_Balance,
                  ebayObj: data,
                  companySQL: companyObj,
                  productID: req.query.id});
                // Data is in format of JSON
                // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
              });
            });
          });
  });
});
app.get('/editBlackList', function(req,res){
  sqlStatement(`SELECT * FROM Item_BlackList WHERE CompanyID=${req.session.companyID};`).then((blacklist) => {
    res.render('editblacklist.ejs',{
        username: req.session.username,
        userID: req.session.userID,
        blacklist: blacklist
    })
  });
});
app.post('/submit-form-notify', async(req, res) => {
  try {  
    req = true;
    var mailOptions = {
      from: 'driverhubautomated@gmail.com',
      to: '<%=email>',
      subject: 'Notifications',
      text: `Successful Signup!`
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
app.get('/notifications', function(req,res){
      res.render('notifications.ejs',{
        username: req.session.username
      });
})
app.get('/profile', function(req,res){
  sqlStatement(`select * from User where Username = "${req.session.username}"`).then((value) => {
    sqlStatement(`select * FROM User_To_Company WHERE idUser="${value.idUser}"`).then((sponsorInfo) =>{
      res.render('profile.ejs',{
        userType: req.session.userType,
        username: req.session.username,
        userID: req.session.userID,
        userObj: value,
        sponsorInfo: sponsorInfo
      });
    })
  });
})
function sponsorPage(req,res){
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
    if(company.length > 0){
      if(company[0].Catalog_Rule){
        catalogRule = company[0].Catalog_Rule + " 99 26395";
      }else{
        catalogRule= "99 26395";
      }
    }
    
    sqlStatement(`SELECT * from User where idUser = "${req.session.userID}"`).then((userObj) => {
      console.log(`Company length: ${company.length}`);
      console.log(`Company length: ${company.Company_Name}`);
      if(company.length == 0){
          res.render("sponsorpage.ejs",{
            username: req.session.username,
            userObj:userObj[0],
            userType: req.session.userType,
            userID: req.session.userID,
            userBalance: 0,
            ebayObj: null,
            companySQL: null,
            userSQL: null});
          // Data is in format of JSON
          // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
      }else{
      ebay.findItemsAdvanced({
          keywords: searchKeyword,
          entriesPerPage: 10,
          pageNumber: parseInt(pageOffset)+1,
          ExcludeCategory: catalogRule
      }).then((data) => {
          
            sqlStatement(`select * from User_To_Company where Company_Id = "${req.session.companyID}" AND idUser = "${req.session.userID}"`).then((value) => {
            if(value[0].Application_Status == "Complete"){
              sqlStatement(`SELECT * from Company where CompanyID = "${req.session.companyID}"`).then((companyObj) => {
                sqlStatement(`SELECT * FROM Item_BlackList WHERE CompanyID=${req.session.companyID};`).then((blacklist) => {
                
                  for(let i = 0; i < data[0].searchResult[0].item.length; i++){
                    data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__ = (companyObj[0].Points_to_Dollar*parseFloat(data[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__)).toFixed(2);
                    for(let j = 0; j < blacklist.length; j++){
                      if(data[0].searchResult[0].item[i].itemId[0] == blacklist[j].itemID){
                        console.log("removed item");
                        data[0].searchResult[0].item.splice(i, 1);
                        i--;
                        break;
                      }
                    }
                    
                  }

                  res.render("sponsorpage.ejs",{
                    username: req.session.username,
                    userObj:userObj[0],
                    userType: req.session.userType,
                    userID: req.session.userID,
                    userBalance: value[0].Point_Balance,
                    ebayObj: data,
                    companySQL: companyObj,
                    userSQL: value});
                  // Data is in format of JSON
                  // To check the format of Data, Go to this url https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#w4-w1-w4-SearchforItemsbyCategory-1.
                 });
              });
            }else{
            res.render("sponsorpage.ejs",{
              username: req.session.username,
              userObj:userObj[0],
              userType: req.session.userType,
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
        }
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