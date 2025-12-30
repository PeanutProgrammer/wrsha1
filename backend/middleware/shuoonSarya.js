const connection = require("../db/dbConnection");
const util = require("util");

const shuoonSarya = async (req, res, next) => {
  try {
    const query = util.promisify(connection.query).bind(connection);

      const token = req.headers.token;
      console.log("hey there from shuoonSarya middleware, token:", token);
      
    if (!token) {
      return next(new Error("shuoonSarya"));
    }

    const userData = await query("SELECT * FROM users WHERE token = ?", [
      token,
    ]);

    if (
      userData.length > 0 &&
      (userData[0].type.trim() === "شؤون ادارية" ||
        userData[0].type.trim() === "admin")
    ) {
      return next(); // authorized
    }

    // unauthorized
    return next(new Error("shuoonSarya"));
  } catch (err) {
    return next(new Error("shuoonSarya"));
  }
};

module.exports = shuoonSarya;
