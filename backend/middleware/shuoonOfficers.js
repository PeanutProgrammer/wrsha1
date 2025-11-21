const connection = require("../db/dbConnection");
const util = require("util");

const shuoonOfficers = async (req, res, next) => {
  try {
    const query = util.promisify(connection.query).bind(connection);

      const token = req.headers.token;
      console.log("hey there from shuoonOfficers middleware, token:", token);
      
    if (!token) {
      return next(new Error("shuoonOfficers"));
    }

    const userData = await query("SELECT * FROM users WHERE token = ?", [
      token,
    ]);

    if (
      userData.length > 0 &&
      (userData[0].type.trim() === "شؤون ضباط" ||
        userData[0].type.trim() === "admin")
    ) {
      return next(); // authorized
    }

    // unauthorized
    return next(new Error("shuoonOfficers"));
  } catch (err) {
    return next(new Error("shuoonOfficers"));
  }
};

module.exports = shuoonOfficers;
