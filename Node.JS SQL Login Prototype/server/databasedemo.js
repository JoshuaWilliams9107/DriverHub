var mysql = require('mysql');

let con = mysql.createConnection({
  host: "***REMOVED***",
  port: 3306,
  user: "admin",
  password: "***REMOVED***",
  database: "sys"
});

let sql = `SELECT * FROM Drivers`;

con.query(sql, (error, results, fields) => {
  if (error) {
    return console.error(error.message);
  }
  console.log(results);
});

