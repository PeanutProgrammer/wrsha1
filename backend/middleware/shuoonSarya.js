const connection = require("../db/dbConnection");
const util = require("util");

const shuoonOfficers = async (req, res, next) => {
    const query = util.promisify(connection.query).bind(connection);
    const { token } = req.headers;

    const userData = await query("select * from users where token = ?", [token]);

        
        
    
    if (userData[0] && (userData[0].type == "شؤون ادارية" || userData[0].type == "admin")) {
        next();
    }

    throw new Error("shuoonSarya");
    

};


module.exports = shuoonOfficers; 