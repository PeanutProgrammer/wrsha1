const connection = require("../db/dbConnection");
const util = require("util");

const securityHeadType = 6;

const securityHead = async (req, res,next) => {
    const query = util.promisify(connection.query).bind(connection);
    const { token } = req.headers; 
    const securityHeadData = await query("select * from users where token = ?", [token]);
    if (securityHeadData[0] && securityHeadData[0].type == securityHeadType) { 
        next();
    } else {
        res.status(403).json({
            msg: "you are not authorized to access this route "
        })
    }
    

}


module.exports = securityHead; 