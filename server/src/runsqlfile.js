// @flow

let mysql = require("mysql");
let fs = require("fs");
let path = require("path");


module.exports = function run(filename: string, pool: function, done: function) {
  console.log("runsqlfile: reading file " + filename);
  let sql = fs.readFileSync(filename, "utf8");
  pool.getConnection((err, connection) => {
    if (err) {
      console.log("runsqlfile: error connecting");
      done();
    } else {
      console.log("runsqlfile: connected");
      connection.query(sql, (err, rows) => {
        connection.release();
        if (err) {
          console.log(err);
          done();
        } else {
          console.log("runsqlfile: run ok");
          done();
        }
      });
    }
  });
};
