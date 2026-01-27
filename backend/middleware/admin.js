const connection = require("../db/dbConnection");
const util = require("util");


const admin = async (req, res,next) => {
    const query = util.promisify(connection.query).bind(connection);
    const { token } = req.headers; 
    const adminData = await query("select * from users where token = ?", [token]);
    if (adminData[0] && adminData[0].type == "admin") { 
        next();
    } 
    throw new Error("admin");
};


module.exports = admin; 