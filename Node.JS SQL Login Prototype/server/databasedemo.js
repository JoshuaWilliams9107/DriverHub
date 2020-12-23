var mysql = require('mysql');

let con = mysql.createConnection({
  host: "database-2.crbonmxqlhis.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "wZ!2o4PKj",
  database: "sys"
});

let sql = `SELECT * FROM Drivers`;

con.query(sql, (error, results, fields) => {
  if (error) {
    return console.error(error.message);
  }
  console.log(results);
});

