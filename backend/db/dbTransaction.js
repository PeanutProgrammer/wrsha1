const pool = require("./dbConnection");
const util = require("util");

async function getTransactionConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      resolve(connection);
    });
  });
}

module.exports = getTransactionConnection;
