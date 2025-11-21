const connection = require("../db/dbConnection");
const util = require("util");

const gate = async (req, res, next) => {
  const query = util.promisify(connection.query).bind(connection);
  const { token } = req.headers;

  const userData = await query("SELECT * FROM users WHERE token = ?", [token]);

  if (
    userData[0] &&
    (userData[0].type === "بوابة" || userData[0].type === "admin")
  ) {
    return next();
  }

  // Don't throw, just do nothing (allowAny will handle it)
};

module.exports = gate;
