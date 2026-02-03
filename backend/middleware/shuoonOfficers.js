const connection = require("../db/dbConnection");
const util = require("util");

const shuoonOfficers = async (req, res, next) => {
  const query = util.promisify(connection.query).bind(connection);
  const { token } = req.headers;

  const userData = await query("SELECT * FROM users WHERE token = ?", [token]);

  if (
    userData[0] &&
    (userData[0].type === "شؤون ضباط" || userData[0].type === "admin")
  ) {
    return next();
  }

  throw new Error("leader");
};

module.exports = shuoonOfficers;
